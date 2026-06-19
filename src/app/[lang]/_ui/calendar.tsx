'use client'

import type { EventType } from '@dto'

import dynamic from 'next/dynamic'

import '@bryntum/calendar/fontawesome/css/fontawesome.css'
import '@bryntum/calendar/fontawesome/css/solid.css'
import '@bryntum/calendar/calendar.css'
import '@bryntum/calendar/svalbard-light.css'

const BryntumCalendar = dynamic(
  () => import('@bryntum/calendar-react').then((mod) => mod.BryntumCalendar),
  {
    ssr: false,
  },
)

const formatEventTime = (date: Date) => {
  const [time = '', meridiem = ''] = date
    .toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
    .split(' ')

  return { time, meridiem }
}

type ScheduleEventRecord = {
  name?: string
  startDate?: Date | string
}

type ScheduleEventRenderData = {
  eventBackground?: string
  textColor?: string
  bodyColor?: string
  solidBar?: boolean
  showBullet?: boolean
  iconCls?: unknown
  cls?: unknown
}

type ScheduleEventRendererContext = {
  eventRecord: ScheduleEventRecord
  renderData: ScheduleEventRenderData
}

const renderScheduleEvent = ({ eventRecord, renderData }: ScheduleEventRendererContext) => {
  const cls = typeof renderData.cls === 'object' && renderData.cls !== null ? renderData.cls : {}
  const startDate = eventRecord.startDate ? new Date(eventRecord.startDate) : new Date()
  const { time, meridiem } = formatEventTime(startDate)

  renderData.eventBackground = '#262626'
  renderData.textColor = '#ffffff'
  renderData.bodyColor = '#ffffff'
  renderData.solidBar = false
  renderData.showBullet = false
  renderData.iconCls = null
  renderData.cls = { ...cls, 'planka-calendar-event-shell': true }

  return {
    className: 'planka-calendar-event',
    children: [
      {
        className: 'planka-calendar-event-stripes',
        children: [
          { className: 'planka-calendar-event-stripe planka-calendar-event-stripe-sport' },
          { className: 'planka-calendar-event-stripe planka-calendar-event-stripe-home' },
          { className: 'planka-calendar-event-stripe planka-calendar-event-stripe-study' },
        ],
      },
      {
        className: 'planka-calendar-event-body',
        children: [
          {
            className: 'planka-calendar-event-time',
            children: [
              {
                className: 'planka-calendar-event-time-value',
                text: time,
              },
              {
                className: 'planka-calendar-event-time-meridiem',
                text: meridiem,
              },
            ],
          },
          {
            className: 'planka-calendar-event-title',
            text: eventRecord.name ?? '',
          },
        ],
      },
    ],
  }
}

export type CalendarTag = {
  id: string
  name: string
  color: string
}

type Props = {
  events: EventType[]
  tags: CalendarTag[]
}

const fallbackTag: CalendarTag = {
  id: 'events',
  name: 'События',
  color: '#91FFB5',
}

const getEventDate = (value: string | null, fallback: string) => new Date(value ?? fallback)

const getEndDate = (event: EventType) => {
  if (event.ends_at) {
    return new Date(event.ends_at)
  }

  const startDate = getEventDate(event.starts_at, event.created_at)
  const endDate = new Date(startDate)

  endDate.setHours(endDate.getHours() + 1)

  return endDate
}

export default function ProfileCalendar({ events, tags }: Props) {
  const resources = tags.length ? tags : [fallbackTag]
  const defaultResourceId = resources[0].id
  const calendarEvents = events.map((event) => ({
    id: event.id,
    name: event.title,
    startDate: getEventDate(event.starts_at, event.created_at),
    endDate: getEndDate(event),
    resourceId: defaultResourceId,
  }))

  const calendarDate = calendarEvents[0]?.startDate ?? new Date()

  return (
    <div className="schedule-calendar h-[860px] w-full overflow-hidden">
      <BryntumCalendar
        height="100%"
        date={calendarDate}
        mode="week"
        weekStartDay={0}
        sidebar={false}
        tbar={null}
        datePicker={false}
        resources={resources.map((tag) => ({
          id: tag.id,
          name: tag.name,
          eventColor: tag.color,
        }))}
        events={calendarEvents}
        modes={{
          day: false,
          week: {
            eventHeaderRenderer: () => '',
            eventRenderer: renderScheduleEvent,
          },
          month: false,
          agenda: false,
        }}
      />
    </div>
  )
}
