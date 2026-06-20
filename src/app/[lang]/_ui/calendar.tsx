'use client'

import './fullcalendar-theme'

import {
  addDays,
  addMonths,
  applyScheduleEventElementStyle,
  buildScheduleTagStripChildren,
  formatScheduleTimeRange,
  getEventTagColors,
  getInitialScheduleDate,
  getLocaleCode,
  startOfWeek,
  toFullCalendarEventRange,
} from './schedule-view-helpers'

import type { EventType, TagType } from '@dto'
import type {
  DatesSetArg,
  EventClickArg,
  EventContentArg,
  EventDropArg,
  EventMountArg,
} from '@fullcalendar/core'
import type { EventResizeDoneArg } from '@fullcalendar/interaction'

import { useLocale } from '@contexts/dictionary-context'
import ruLocale from '@fullcalendar/core/locales/ru'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { cn } from '@utils'
import { CalendarDays, ChevronLeft, ChevronRight, PanelsTopLeft, Rows3 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type EventDateChangeInput = {
  id: string
  starts_at: string
  ends_at: string
}

type Props = {
  events: EventType[]
  tags: Pick<TagType, 'id' | 'name' | 'color'>[]
  onEventClick?: (event: EventType) => void
  onEventDateChange?: (input: EventDateChangeInput) => Promise<void>
  themeKey?: string
}

type CalendarMode = 'day' | 'week' | 'month'

const VIEW_BY_MODE: Record<CalendarMode, string> = {
  day: 'timeGridDay',
  week: 'timeGridWeek',
  month: 'dayGridMonth',
}

const shiftCalendarDate = (value: Date, mode: CalendarMode, direction: number) => {
  if (mode === 'month') {
    return addMonths(value, direction)
  }

  return addDays(value, direction * (mode === 'week' ? 7 : 1))
}

const formatCalendarTitle = (value: Date, mode: CalendarMode, localeCode: string) => {
  if (mode === 'day') {
    return new Intl.DateTimeFormat(localeCode, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(value)
  }

  if (mode === 'month') {
    return new Intl.DateTimeFormat(localeCode, {
      month: 'long',
      year: 'numeric',
    }).format(value)
  }

  const startDate = startOfWeek(value)
  const endDate = addDays(startDate, 6)
  const formatter = new Intl.DateTimeFormat(localeCode, {
    day: 'numeric',
    month: 'short',
  })

  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`
}

const resolveEventRange = (start: Date | null, end: Date | null) => {
  if (!start) {
    throw new Error('Missing start date')
  }

  let resolvedEnd =
    end ??
    (() => {
      const fallbackEnd = new Date(start)
      fallbackEnd.setHours(fallbackEnd.getHours() + 1)
      return fallbackEnd
    })()

  if (resolvedEnd <= start) {
    resolvedEnd = new Date(start)
    resolvedEnd.setHours(resolvedEnd.getHours() + 1)
  }

  return {
    starts_at: start.toISOString(),
    ends_at: resolvedEnd.toISOString(),
  }
}

type CalendarEventContentProps = {
  title: string
  tagColors: string[]
  focus: number
  timeText?: string
}

function CalendarEventContent({ title, tagColors, focus, timeText }: CalendarEventContentProps) {
  const swatches = buildScheduleTagStripChildren(tagColors, focus)

  return (
    <div className="schedule-calendar-event">
      <div className="schedule-event-tag-strip">
        {swatches.map((swatch, index) => (
          <span
            key={`${swatch.className}-${index}`}
            className={swatch.className}
            style={swatch.style}
          />
        ))}
      </div>
      {timeText ? <div className="schedule-calendar-event-time">{timeText}</div> : null}
      <div className="schedule-calendar-event-title">{title}</div>
    </div>
  )
}

export default function ProfileCalendar({
  events,
  onEventClick,
  onEventDateChange,
  themeKey = 'dark',
}: Props) {
  const locale = useLocale()
  const localeCode = getLocaleCode(locale)
  const labels =
    locale === 'ru'
      ? {
          today: 'Сегодня',
          day: 'День',
          week: 'Неделя',
          month: 'Месяц',
        }
      : {
          today: 'Today',
          day: 'Day',
          week: 'Week',
          month: 'Month',
        }

  const calendarRef = useRef<FullCalendar>(null)
  const initialDate = useMemo(() => getInitialScheduleDate(events), [events])
  const [mode, setMode] = useState<CalendarMode>('week')
  const [currentDate, setCurrentDate] = useState(initialDate)
  const didNavigate = useRef(false)

  useEffect(() => {
    if (!didNavigate.current) {
      setCurrentDate(initialDate)
      calendarRef.current?.getApi().gotoDate(initialDate)
    }
  }, [initialDate])

  const calendarEvents = useMemo(
    () =>
      events.map((event) => {
        const range = toFullCalendarEventRange(event)

        return {
          id: event.id,
          title: event.title,
          start: range.start,
          end: range.end,
          allDay: range.allDay,
          extendedProps: {
            tagColors: getEventTagColors(event),
            focus: event.focus,
          },
        }
      }),
    [events],
  )

  const scrollTime = useMemo(() => {
    if (!events.length) {
      return '08:00:00'
    }

    const start = toFullCalendarEventRange(events[0]).start
    const pad = (value: number) => String(value).padStart(2, '0')

    return `${pad(start.getHours())}:${pad(start.getMinutes())}:00`
  }, [events])

  const persistEventChange = useCallback(
    async (eventId: string, start: Date | null, end: Date | null, revert: () => void) => {
      if (!onEventDateChange) {
        return
      }

      try {
        const range = resolveEventRange(start, end)
        await onEventDateChange({
          id: eventId,
          ...range,
        })
      } catch {
        revert()
      }
    },
    [onEventDateChange],
  )

  const handleEventDrop = useCallback(
    (info: EventDropArg) => {
      void persistEventChange(info.event.id, info.event.start, info.event.end, info.revert)
    },
    [persistEventChange],
  )

  const handleEventResize = useCallback(
    (info: EventResizeDoneArg) => {
      void persistEventChange(info.event.id, info.event.start, info.event.end, info.revert)
    },
    [persistEventChange],
  )

  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      info.jsEvent.preventDefault()

      const event = events.find((item) => item.id === info.event.id)

      if (event) {
        onEventClick?.(event)
      }
    },
    [events, onEventClick],
  )

  const handleEventDidMount = useCallback((info: EventMountArg) => {
    const tagColors = (info.event.extendedProps.tagColors as string[] | undefined) ?? []
    const focus = (info.event.extendedProps.focus as number | undefined) ?? 0

    applyScheduleEventElementStyle(info.el, tagColors, focus)

    const mainElement = info.el.querySelector('.fc-event-main')

    if (mainElement instanceof HTMLElement) {
      applyScheduleEventElementStyle(mainElement, tagColors, focus)
    }
  }, [])

  const renderEventContent = useCallback(
    (info: EventContentArg) => {
      const tagColors = (info.event.extendedProps.tagColors as string[] | undefined) ?? []
      const focus = (info.event.extendedProps.focus as number | undefined) ?? 0
      const start = info.event.start
      const end = info.event.end
      const timeText =
        start && end && !info.event.allDay
          ? info.timeText || formatScheduleTimeRange(start, end, localeCode)
          : info.timeText

      return (
        <CalendarEventContent
          title={info.event.title}
          tagColors={tagColors}
          focus={focus}
          timeText={timeText}
        />
      )
    },
    [localeCode],
  )

  const setNavigatedDate = (value: Date) => {
    didNavigate.current = true
    setCurrentDate(value)
    calendarRef.current?.getApi().gotoDate(value)
  }

  const setViewMode = (nextMode: CalendarMode) => {
    setMode(nextMode)
    calendarRef.current?.getApi().changeView(VIEW_BY_MODE[nextMode], currentDate)
  }

  const handleDatesSet = (info: DatesSetArg) => {
    if (didNavigate.current) {
      return
    }

    setCurrentDate(info.view.currentStart)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-muted)]"
            onClick={() => setNavigatedDate(shiftCalendarDate(currentDate, mode, -1))}
            title={locale === 'ru' ? 'Предыдущий период' : 'Previous period'}
          >
            <ChevronLeft className="size-5" />
          </button>

          <button
            type="button"
            className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-muted)]"
            onClick={() => setNavigatedDate(new Date())}
          >
            {labels.today}
          </button>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-muted)]"
            onClick={() => setNavigatedDate(shiftCalendarDate(currentDate, mode, 1))}
            title={locale === 'ru' ? 'Следующий период' : 'Next period'}
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold capitalize text-[color:var(--foreground)]">
            {formatCalendarTitle(currentDate, mode, localeCode)}
          </div>
        </div>

        <div className="inline-flex w-fit rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-1">
          {[
            { key: 'day' as const, label: labels.day, icon: Rows3 },
            { key: 'week' as const, label: labels.week, icon: CalendarDays },
            { key: 'month' as const, label: labels.month, icon: PanelsTopLeft },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              className={cn(
                'flex min-w-[118px] items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition',
                mode === item.key
                  ? 'bg-accent text-primary shadow-sm'
                  : 'text-[color:var(--muted-foreground)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--foreground)]',
              )}
              onClick={() => setViewMode(item.key)}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div
        key={themeKey}
        className="schedule-fullcalendar h-[760px] w-full overflow-hidden rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)] p-2"
      >
        <FullCalendar
          ref={calendarRef}
          key={themeKey}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={VIEW_BY_MODE.week}
          initialDate={initialDate}
          locale={locale === 'ru' ? ruLocale : 'en'}
          timeZone="local"
          firstDay={1}
          headerToolbar={false}
          height="100%"
          nowIndicator
          allDaySlot={false}
          forceEventDuration
          defaultTimedEventDuration="01:00:00"
          eventMinHeight={24}
          editable={Boolean(onEventDateChange)}
          eventStartEditable={Boolean(onEventDateChange)}
          eventDurationEditable={Boolean(onEventDateChange)}
          events={calendarEvents}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventContent={renderEventContent}
          eventDidMount={handleEventDidMount}
          datesSet={handleDatesSet}
          dayMaxEvents={3}
          slotDuration="00:30:00"
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          scrollTime={scrollTime}
          scrollTimeReset={false}
        />
      </div>
    </div>
  )
}
