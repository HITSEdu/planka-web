'use client'

import './bryntum-theme'

import {
  addDays,
  addMonths,
  getEventEndDate,
  getEventResources,
  getEventStartDate,
  getInitialScheduleDate,
  getLocaleCode,
  getScheduleResources,
  startOfWeek,
} from './schedule-view-helpers'

import type { EventType, TagType } from '@dto'

import { useLocale } from '@contexts/dictionary-context'
import { cn } from '@utils'
import { CalendarDays, ChevronLeft, ChevronRight, PanelsTopLeft, Rows3 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState } from 'react'

const BryntumCalendar = dynamic(
  () => import('@bryntum/calendar-react').then((mod) => mod.BryntumCalendar),
  {
    ssr: false,
  },
)

type Props = {
  events: EventType[]
  tags: Pick<TagType, 'id' | 'name' | 'color'>[]
  onEventClick?: (event: EventType) => void
}

type CalendarMode = 'day' | 'week' | 'month'

type CalendarEventClickContext = {
  eventRecord: {
    id?: string | number
  }
}

type CalendarDateChangeContext = {
  date: Date
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

export default function ProfileCalendar({ events, tags, onEventClick }: Props) {
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

  const initialDate = useMemo(() => getInitialScheduleDate(events), [events])
  const [mode, setMode] = useState<CalendarMode>('week')
  const [currentDate, setCurrentDate] = useState(initialDate)
  const didNavigate = useRef(false)

  useEffect(() => {
    if (!didNavigate.current) {
      setCurrentDate(initialDate)
    }
  }, [initialDate])

  const resources = useMemo(() => getScheduleResources(tags, events), [events, tags])

  const calendarEvents = useMemo(() => {
    const defaultResourceId = resources[0]?.id

    return events.map((event) => {
      const primaryResource = getEventResources(event)[0]

      return {
        id: event.id,
        name: event.title,
        startDate: getEventStartDate(event),
        endDate: getEventEndDate(event),
        resourceId: primaryResource?.id ?? defaultResourceId,
        eventColor: primaryResource?.color,
      }
    })
  }, [events, resources])

  const setNavigatedDate = (value: Date) => {
    didNavigate.current = true
    setCurrentDate(value)
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
              onClick={() => setMode(item.key)}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="schedule-bryntum h-[760px] w-full overflow-hidden rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)]">
        <BryntumCalendar
          height="100%"
          date={currentDate}
          mode={mode}
          weekStartDay={1}
          sidebar={false}
          datePicker={false}
          tbar={null}
          readOnly
          resources={resources.map((tag) => ({
            id: tag.id,
            name: tag.name,
            eventColor: tag.color,
          }))}
          events={calendarEvents}
          modes={{
            day: true,
            week: true,
            month: true,
            agenda: false,
            year: false,
            list: false,
          }}
          onDateChange={({ date }: CalendarDateChangeContext) => {
            didNavigate.current = true
            setCurrentDate(new Date(date))
          }}
          onEventClick={({ eventRecord }: CalendarEventClickContext) => {
            const event = events.find((item) => item.id === String(eventRecord.id))

            if (event) {
              onEventClick?.(event)
            }
          }}
        />
      </div>
    </div>
  )
}
