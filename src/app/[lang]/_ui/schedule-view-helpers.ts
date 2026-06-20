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
  if (event.ends_at) {
    return new Date(event.ends_at)
  }

  const startDate = getEventStartDate(event)
  const endDate = new Date(startDate)

  endDate.setHours(endDate.getHours() + 1)

  return endDate
}

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
