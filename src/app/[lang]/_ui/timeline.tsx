'use client'

import './bryntum-theme'

import {
  addDays,
  endOfWeek,
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
import { ChevronLeft, ChevronRight, StretchHorizontal } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState } from 'react'

const BryntumScheduler = dynamic(
  () => import('@bryntum/calendar-react').then((mod) => mod.BryntumScheduler),
  {
    ssr: false,
  },
)

type Props = {
  events: EventType[]
  tags: Pick<TagType, 'id' | 'name' | 'color'>[]
  onEventClick?: (event: EventType) => void
}

type TimelinePreset = 'week' | 'fortnight'

type TimelineEventRecord = {
  sourceEventId?: string
  eventColor?: string
  tagLabel?: string
  focus?: number
}

type TimelineEventModelShape = {
  data?: TimelineEventRecord
  name?: string
}

type SchedulerEventClickContext = {
  eventRecord: {
    id?: string | number
    data?: TimelineEventRecord
  }
}

const getContrastTextColor = (hex: string) => {
  const normalized = hex.replace('#', '')
  const safeHex =
    normalized.length === 3
      ? normalized
          .split('')
          .map((item) => `${item}${item}`)
          .join('')
      : normalized

  const red = parseInt(safeHex.slice(0, 2), 16)
  const green = parseInt(safeHex.slice(2, 4), 16)
  const blue = parseInt(safeHex.slice(4, 6), 16)
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000

  return brightness > 155 ? '#0F172A' : '#FFFFFF'
}

const getPresetRange = (value: Date, preset: TimelinePreset) => {
  const startDate = startOfWeek(value)
  const endDate = preset === 'week' ? endOfWeek(value) : addDays(startDate, 13)

  return { startDate, endDate }
}

const formatTimelineRange = (startDate: Date, endDate: Date, localeCode: string) => {
  const formatter = new Intl.DateTimeFormat(localeCode, {
    day: 'numeric',
    month: 'short',
  })

  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`
}

export default function ProfileTimeline({ events, tags, onEventClick }: Props) {
  const locale = useLocale()
  const localeCode = getLocaleCode(locale)
  const labels =
    locale === 'ru'
      ? {
          today: 'Сегодня',
          week: '7 дней',
          fortnight: '14 дней',
          lane: 'Тэг',
          focus: 'Фокус',
        }
      : {
          today: 'Today',
          week: '7 days',
          fortnight: '14 days',
          lane: 'Tag',
          focus: 'Focus',
        }

  const initialDate = useMemo(() => getInitialScheduleDate(events), [events])
  const [preset, setPreset] = useState<TimelinePreset>('week')
  const [anchorDate, setAnchorDate] = useState(initialDate)
  const didNavigate = useRef(false)

  useEffect(() => {
    if (!didNavigate.current) {
      setAnchorDate(initialDate)
    }
  }, [initialDate])

  const resources = useMemo(() => getScheduleResources(tags, events), [events, tags])

  const schedulerEvents = useMemo(
    () =>
      events.flatMap((event) =>
        getEventResources(event).map((resource) => ({
          id: `${event.id}:${resource.id}`,
          sourceEventId: event.id,
          name: event.title,
          startDate: getEventStartDate(event),
          endDate: getEventEndDate(event),
          resourceId: resource.id,
          eventColor: resource.color,
          tagLabel: resource.name,
          focus: event.focus,
        })),
      ),
    [events],
  )

  const { startDate, endDate } = getPresetRange(anchorDate, preset)

  const setNavigatedDate = (value: Date) => {
    didNavigate.current = true
    setAnchorDate(value)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-muted)]"
            onClick={() => setNavigatedDate(addDays(anchorDate, preset === 'week' ? -7 : -14))}
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
            onClick={() => setNavigatedDate(addDays(anchorDate, preset === 'week' ? 7 : 14))}
            title={locale === 'ru' ? 'Следующий период' : 'Next period'}
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]">
            <StretchHorizontal className="size-4 text-accent" />
            {formatTimelineRange(startDate, endDate, localeCode)}
          </div>
        </div>

        <div className="inline-flex w-fit rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-1">
          {[
            { key: 'week' as const, label: labels.week },
            { key: 'fortnight' as const, label: labels.fortnight },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              className={cn(
                'min-w-[118px] rounded-lg px-4 py-2 text-sm font-semibold transition',
                preset === item.key
                  ? 'bg-accent text-primary shadow-sm'
                  : 'text-[color:var(--muted-foreground)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--foreground)]',
              )}
              onClick={() => setPreset(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="schedule-bryntum h-[760px] w-full overflow-hidden rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)]">
        <BryntumScheduler
          height="100%"
          mode="horizontal"
          readOnly
          startDate={startDate}
          endDate={endDate}
          viewPreset={preset === 'week' ? 'dayAndWeek' : 'weekAndDayLetter'}
          rowHeight={76}
          barMargin={10}
          eventStyle="rounded"
          columns={[
            {
              text: labels.lane,
              field: 'name',
              width: 220,
            },
          ]}
          resources={resources}
          events={schedulerEvents}
          tbar={null}
          onEventClick={({ eventRecord }: SchedulerEventClickContext) => {
            const sourceEventId = (eventRecord as TimelineEventModelShape).data?.sourceEventId

            if (!sourceEventId) {
              return
            }

            const event = events.find((item) => item.id === sourceEventId)

            if (event) {
              onEventClick?.(event)
            }
          }}
          eventRenderer={({ eventRecord, renderData }) => {
            const eventData = (eventRecord as TimelineEventModelShape).data
            const { eventColor = '#375FFF', focus = 0, tagLabel = '' } = eventData ?? {}
            const textColor = getContrastTextColor(eventColor)

            renderData.style = {
              backgroundColor: eventColor,
              color: textColor,
              borderColor: eventColor,
            }

            return {
              className: 'schedule-timeline-event',
              children: [
                {
                  className: 'schedule-timeline-event-title',
                  text: String((eventRecord as TimelineEventModelShape).name ?? ''),
                },
                {
                  className: 'schedule-timeline-event-meta',
                  text: `${tagLabel} • ${labels.focus} ${Math.round(focus * 100)}%`,
                },
              ],
            }
          }}
        />
      </div>
    </div>
  )
}
