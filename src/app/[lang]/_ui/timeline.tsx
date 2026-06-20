'use client'

import {
  addDays,
  buildScheduleTagStripChildren,
  fallbackResource,
  formatScheduleTimeRange,
  getContrastTextColor,
  getEventEndDate,
  getEventResources,
  getEventStartDate,
  getEventTagColors,
  getInitialScheduleDate,
  getLocaleCode,
  getScheduleResources,
  getTagColorGradient,
  startOfWeek,
} from './schedule-view-helpers'

import type { ScheduleResource } from './schedule-view-helpers'
import type { EventType, TagType } from '@dto'
import type { CSSProperties } from 'react'

import { useLocale } from '@contexts/dictionary-context'
import { cn } from '@utils'
import { ChevronLeft, ChevronRight, StretchHorizontal } from 'lucide-react'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  events: EventType[]
  tags: Pick<TagType, 'id' | 'name' | 'color'>[]
  onEventClick?: (event: EventType) => void
  themeKey?: string
}

type TimelinePreset = 'week' | 'fortnight'

type TimelineRange = {
  dayCount: number
  displayEndDate: Date
  endDate: Date
  startDate: Date
}

type TimelineSegment = {
  daySpan: number
  endIndex: number
  event: EventType
  focus: number
  id: string
  level: number
  startDate: Date
  startIndex: number
  tagColors: string[]
  tagLabel: string
  timeLabel: string
}

type TimelineLane = ScheduleResource & {
  height: number
  levelCount: number
  segments: TimelineSegment[]
}

const DAY_IN_MS = 24 * 60 * 60 * 1000
const LABEL_COLUMN_WIDTH = 220
const WEEK_DAY_MIN_WIDTH = 132
const FORTNIGHT_DAY_MIN_WIDTH = 112
const EVENT_CARD_HEIGHT = 64
const EVENT_LEVEL_GAP = 8
const ROW_VERTICAL_PADDING = 24

const getPresetRange = (value: Date, preset: TimelinePreset): TimelineRange => {
  const dayCount = preset === 'week' ? 7 : 14
  const startDate = startOfWeek(value)
  const endDate = addDays(startDate, dayCount)
  const displayEndDate = addDays(endDate, -1)

  return { dayCount, displayEndDate, endDate, startDate }
}

const formatTimelineRange = (startDate: Date, endDate: Date, localeCode: string) => {
  const formatter = new Intl.DateTimeFormat(localeCode, {
    day: 'numeric',
    month: 'short',
  })

  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`
}

const startOfDay = (value: Date) => {
  const nextDate = new Date(value)

  nextDate.setHours(0, 0, 0, 0)

  return nextDate
}

const isSameDay = (left: Date, right: Date) =>
  startOfDay(left).getTime() === startOfDay(right).getTime()

const isWeekend = (value: Date) => {
  const day = value.getDay()

  return day === 0 || day === 6
}

const getTimelineRowHeight = (levelCount: number) =>
  EVENT_CARD_HEIGHT * levelCount + EVENT_LEVEL_GAP * (levelCount - 1) + ROW_VERTICAL_PADDING

const getSegmentDayIndex = (value: Date, rangeStartTime: number, dayCount: number) => {
  const dayIndex = Math.floor((startOfDay(value).getTime() - rangeStartTime) / DAY_IN_MS)

  return Math.min(dayCount - 1, Math.max(0, dayIndex))
}

const createTimelineEventStyle = (tagColors: string[], focus: number): CSSProperties => {
  const palette = tagColors.length ? tagColors : [fallbackResource.color]

  return {
    background: getTagColorGradient(palette, focus),
    borderColor: palette[0],
    color: getContrastTextColor(palette[0]),
  }
}

const stackTimelineSegments = (segments: TimelineSegment[]) => {
  const levelEndIndexes: number[] = []

  return [...segments]
    .sort((left, right) => {
      const startDiff = left.startDate.getTime() - right.startDate.getTime()

      if (startDiff !== 0) {
        return startDiff
      }

      return left.event.title.localeCompare(right.event.title)
    })
    .map((segment) => {
      const existingLevel = levelEndIndexes.findIndex((endIndex) => segment.startIndex > endIndex)
      const level = existingLevel === -1 ? levelEndIndexes.length : existingLevel

      levelEndIndexes[level] = segment.endIndex

      return {
        ...segment,
        level,
      }
    })
}

export default function ProfileTimeline({ events, tags, onEventClick, themeKey = 'dark' }: Props) {
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
          events: 'событий',
          emptyLane: 'Нет событий',
        }
      : {
          today: 'Today',
          week: '7 days',
          fortnight: '14 days',
          lane: 'Tag',
          focus: 'Focus',
          events: 'events',
          emptyLane: 'No events',
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

  const { dayCount, displayEndDate, endDate, startDate } = getPresetRange(anchorDate, preset)
  const rangeStartTime = startDate.getTime()
  const rangeEndTime = endDate.getTime()
  const dayMinWidth = preset === 'week' ? WEEK_DAY_MIN_WIDTH : FORTNIGHT_DAY_MIN_WIDTH

  const dayNameFormatter = useMemo(
    () => new Intl.DateTimeFormat(localeCode, { weekday: 'short' }),
    [localeCode],
  )
  const dayDateFormatter = useMemo(
    () => new Intl.DateTimeFormat(localeCode, { day: 'numeric', month: 'short' }),
    [localeCode],
  )

  const days = useMemo(
    () => Array.from({ length: dayCount }, (_, index) => addDays(startDate, index)),
    [dayCount, startDate],
  )

  const lanes = useMemo<TimelineLane[]>(
    () =>
      resources.map((resource) => {
        const segments = stackTimelineSegments(
          events.flatMap((event) => {
            const eventResources = getEventResources(event)

            if (!eventResources.some((eventResource) => eventResource.id === resource.id)) {
              return []
            }

            const eventStartDate = getEventStartDate(event)
            const eventEndDate = getEventEndDate(event)

            if (eventEndDate <= startDate || eventStartDate >= endDate) {
              return []
            }

            const clippedStartDate =
              eventStartDate < startDate ? new Date(rangeStartTime) : eventStartDate
            const clippedEndTime = Math.min(eventEndDate.getTime(), rangeEndTime)
            const clippedEndDate = new Date(
              Math.max(clippedEndTime - 1, clippedStartDate.getTime()),
            )
            const startIndex = getSegmentDayIndex(clippedStartDate, rangeStartTime, dayCount)
            const endIndex = getSegmentDayIndex(clippedEndDate, rangeStartTime, dayCount)
            const tagColors = getEventTagColors(event)

            return [
              {
                daySpan: endIndex - startIndex + 1,
                endIndex,
                event,
                focus: event.focus,
                id: `${event.id}:${resource.id}`,
                level: 0,
                startDate: eventStartDate,
                startIndex,
                tagColors,
                tagLabel: resource.name,
                timeLabel: formatScheduleTimeRange(eventStartDate, eventEndDate, localeCode),
              },
            ]
          }),
        )
        const levelCount = Math.max(1, ...segments.map((segment) => segment.level + 1))

        return {
          ...resource,
          height: getTimelineRowHeight(levelCount),
          levelCount,
          segments,
        }
      }),
    [dayCount, endDate, events, localeCode, rangeEndTime, rangeStartTime, resources, startDate],
  )

  const timelineGridStyle = {
    gridTemplateColumns: `${LABEL_COLUMN_WIDTH}px repeat(${dayCount}, minmax(${dayMinWidth}px, 1fr))`,
    minWidth: LABEL_COLUMN_WIDTH + dayCount * dayMinWidth,
  }

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
            {formatTimelineRange(startDate, displayEndDate, localeCode)}
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

      <div
        key={themeKey}
        className="schedule-timeline h-[760px] w-full overflow-hidden rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)]"
      >
        <div className="schedule-timeline-scroll">
          <div className="schedule-timeline-grid" style={timelineGridStyle}>
            <div className="schedule-timeline-corner">{labels.lane}</div>

            {days.map((day) => (
              <div
                key={day.toISOString()}
                className="schedule-timeline-day-header"
                data-today={isSameDay(day, new Date())}
                data-weekend={isWeekend(day)}
              >
                <span>{dayNameFormatter.format(day)}</span>
                <strong>{dayDateFormatter.format(day)}</strong>
              </div>
            ))}

            {lanes.map((lane, laneIndex) => {
              const gridRow = laneIndex + 2

              return (
                <Fragment key={lane.id}>
                  <div className="schedule-timeline-lane" style={{ gridRow, height: lane.height }}>
                    <span
                      className="schedule-timeline-lane-swatch"
                      style={{ background: lane.color }}
                    />
                    <div className="min-w-0">
                      <div className="schedule-timeline-lane-title">{lane.name}</div>
                      <div className="schedule-timeline-lane-meta">
                        {lane.segments.length
                          ? `${lane.segments.length} ${labels.events}`
                          : labels.emptyLane}
                      </div>
                    </div>
                  </div>

                  <div
                    className="schedule-timeline-row"
                    style={{
                      gridColumn: `2 / span ${dayCount}`,
                      gridRow,
                      height: lane.height,
                    }}
                  >
                    <div
                      className="schedule-timeline-row-grid"
                      style={{
                        gridTemplateColumns: `repeat(${dayCount}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${lane.levelCount}, ${EVENT_CARD_HEIGHT}px)`,
                      }}
                    >
                      {days.map((day, index) => (
                        <div
                          key={`${lane.id}:${day.toISOString()}`}
                          className="schedule-timeline-day-cell"
                          data-today={isSameDay(day, new Date())}
                          data-weekend={isWeekend(day)}
                          style={{
                            gridColumn: index + 1,
                            gridRow: `1 / span ${lane.levelCount}`,
                          }}
                        />
                      ))}

                      {lane.segments.map((segment) => {
                        const swatches = buildScheduleTagStripChildren(
                          segment.tagColors,
                          segment.focus,
                        )

                        return (
                          <button
                            key={segment.id}
                            type="button"
                            className="schedule-timeline-event"
                            disabled={!onEventClick}
                            onClick={() => onEventClick?.(segment.event)}
                            style={{
                              ...createTimelineEventStyle(segment.tagColors, segment.focus),
                              gridColumn: `${segment.startIndex + 1} / span ${segment.daySpan}`,
                              gridRow: segment.level + 1,
                            }}
                            title={`${segment.event.title} · ${segment.tagLabel} · ${segment.timeLabel}`}
                          >
                            <span className="schedule-event-tag-strip">
                              {swatches.map((swatch, index) => (
                                <span
                                  key={`${swatch.className}-${index}`}
                                  className={swatch.className}
                                  style={swatch.style}
                                />
                              ))}
                            </span>
                            <span className="schedule-timeline-event-title">
                              {segment.event.title}
                            </span>
                            <span className="schedule-timeline-event-meta">
                              {segment.timeLabel} · {labels.focus} {Math.round(segment.focus * 100)}
                              %
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </Fragment>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
