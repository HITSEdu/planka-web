import type { EventType, TagType } from '@dto'

export type ScheduleResource = Pick<TagType, 'id' | 'name' | 'color'>

export const fallbackResource: ScheduleResource = {
  id: 'untagged',
  name: 'Без тэга',
  color: '#94A3B8',
}

export const getLocaleCode = (locale: 'ru' | 'en') => (locale === 'ru' ? 'ru-RU' : 'en-US')

export const getEventStartDate = (event: EventType) => new Date(event.starts_at ?? event.created_at)

export const getEventEndDate = (event: EventType) => {
  const startDate = getEventStartDate(event)

  if (event.ends_at) {
    const endDate = new Date(event.ends_at)

    if (endDate > startDate) {
      return endDate
    }
  }

  const endDate = new Date(startDate)

  endDate.setHours(endDate.getHours() + 1)

  return endDate
}

export const toFullCalendarEventRange = (event: EventType) => {
  const start = getEventStartDate(event)
  let end = getEventEndDate(event)

  if (end <= start) {
    end = new Date(start)
    end.setHours(end.getHours() + 1)
  }

  return {
    start,
    end,
    allDay: false as const,
  }
}

export const formatScheduleTime = (value: Date, localeCode: string) =>
  new Intl.DateTimeFormat(localeCode, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(value)

export const formatScheduleTimeRange = (start: Date, end: Date, localeCode: string) =>
  `${formatScheduleTime(start, localeCode)} – ${formatScheduleTime(end, localeCode)}`

export const getInitialScheduleDate = (events: EventType[]) => {
  if (!events.length) {
    return new Date()
  }

  return events.reduce((earliestDate, event) => {
    const eventDate = getEventStartDate(event)

    return eventDate < earliestDate ? eventDate : earliestDate
  }, getEventStartDate(events[0]))
}

export const getEventResources = (event: EventType): ScheduleResource[] =>
  event.tags.length
    ? event.tags.map(({ id, name, color }) => ({ id, name, color }))
    : [fallbackResource]

export const getEventTagColors = (event: EventType) =>
  getEventResources(event).map((resource) => resource.color)

const normalizeHexColor = (hex: string) => {
  const normalized = hex.replace('#', '')
  return normalized.length === 3
    ? normalized
        .split('')
        .map((item) => `${item}${item}`)
        .join('')
    : normalized
}

export const hexToRgba = (hex: string, alpha: number) => {
  const safeHex = normalizeHexColor(hex)
  const red = parseInt(safeHex.slice(0, 2), 16)
  const green = parseInt(safeHex.slice(2, 4), 16)
  const blue = parseInt(safeHex.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

export const getEventFocusOpacity = (focus: number) => {
  const clamped = Math.min(1, Math.max(0, focus))

  return 0.2 + clamped * 0.8
}

export const getTagColorGradient = (colors: string[], focus = 1) => {
  const alpha = getEventFocusOpacity(focus)
  const palette = colors.length ? colors : [fallbackResource.color]

  if (palette.length === 1) {
    return hexToRgba(palette[0], alpha)
  }

  const segment = 100 / palette.length
  const stops = palette
    .map((color, index) => {
      const start = (index * segment).toFixed(2)
      const end = ((index + 1) * segment).toFixed(2)

      return `${hexToRgba(color, alpha)} ${start}%, ${hexToRgba(color, alpha)} ${end}%`
    })
    .join(', ')

  return `linear-gradient(90deg, ${stops})`
}

export const getContrastTextColor = (hex: string) => {
  const safeHex = normalizeHexColor(hex)
  const red = parseInt(safeHex.slice(0, 2), 16)
  const green = parseInt(safeHex.slice(2, 4), 16)
  const blue = parseInt(safeHex.slice(4, 6), 16)
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000

  return brightness > 155 ? '#0F172A' : '#FFFFFF'
}

type ScheduleEventRenderData = {
  style?: Record<string, string> | string
}

export const applyScheduleEventStyle = (
  renderData: ScheduleEventRenderData,
  tagColors: string[],
  focus: number,
) => {
  const palette = tagColors.length ? tagColors : [fallbackResource.color]
  const background = getTagColorGradient(palette, focus)
  const textColor = getContrastTextColor(palette[0])
  const baseStyle =
    typeof renderData.style === 'string' || !renderData.style ? {} : renderData.style

  renderData.style = {
    ...baseStyle,
    background,
    color: textColor,
    borderColor: palette[0],
    fontFamily: 'var(--font-raleway), arial, sans-serif',
  }
}

export const applyScheduleEventElementStyle = (
  element: HTMLElement,
  tagColors: string[],
  focus: number,
) => {
  const palette = tagColors.length ? tagColors : [fallbackResource.color]
  const background = getTagColorGradient(palette, focus)
  const textColor = getContrastTextColor(palette[0])

  element.style.background = background
  element.style.color = textColor
  element.style.borderColor = palette[0]
  element.style.fontFamily = 'var(--font-raleway), arial, sans-serif'
}

export const buildScheduleTagStripChildren = (tagColors: string[], focus: number) => {
  const palette = tagColors.length ? tagColors : [fallbackResource.color]
  const opacity = getEventFocusOpacity(focus)

  return palette.map((color) => ({
    className: 'schedule-event-tag-swatch',
    style: {
      backgroundColor: hexToRgba(color, opacity),
    },
  }))
}

export const getScheduleResources = (tags: ScheduleResource[], events: EventType[]) => {
  const resources = tags.map(({ id, name, color }) => ({ id, name, color }))

  if (!resources.length || events.some((event) => event.tags.length === 0)) {
    resources.push(fallbackResource)
  }

  return resources
}

export const addDays = (value: Date, days: number) => {
  const nextDate = new Date(value)

  nextDate.setDate(nextDate.getDate() + days)

  return nextDate
}

export const addMonths = (value: Date, months: number) => {
  const nextDate = new Date(value)

  nextDate.setMonth(nextDate.getMonth() + months)

  return nextDate
}

export const startOfWeek = (value: Date, weekStartDay: number = 1) => {
  const nextDate = new Date(value)
  const day = nextDate.getDay()
  const diff = (day - weekStartDay + 7) % 7

  nextDate.setHours(0, 0, 0, 0)
  nextDate.setDate(nextDate.getDate() - diff)

  return nextDate
}

export const endOfWeek = (value: Date, weekStartDay: number = 1) => {
  const nextDate = startOfWeek(value, weekStartDay)

  nextDate.setDate(nextDate.getDate() + 6)
  nextDate.setHours(23, 59, 59, 999)

  return nextDate
}
