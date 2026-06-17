'use client'

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

export default function ProfileCalendar() {
  const calendarResources = [
    {
      id: 1,
      name: 'Работа',
      eventColor: 'blue',
    },
    {
      id: 2,
      name: 'Личное',
      eventColor: 'green',
    },
  ]

  const calendarEvents = [
    {
      id: 1,
      name: 'Daily Standup',
      startDate: '2026-06-16T09:00:00',
      endDate: '2026-06-16T09:30:00',
      resourceId: 1,
    },
    {
      id: 2,
      name: 'Созвон с клиентом',
      startDate: '2026-06-16T14:00:00',
      endDate: '2026-06-16T15:00:00',
      resourceId: 1,
    },
    {
      id: 3,
      name: 'Тренировка',
      startDate: '2026-06-17T18:00:00',
      endDate: '2026-06-17T19:30:00',
      resourceId: 2,
    },
    {
      id: 4,
      name: 'Отпуск',
      startDate: '2026-06-20',
      endDate: '2026-06-23',
      allDay: true,
      resourceId: 2,
    },
  ]

  return (
    <div className="w-full h-[700px] rounded-xl overflow-hidden">
      <BryntumCalendar
        date={new Date()}
        resources={calendarResources}
        events={calendarEvents}
        modes={{
          day: true,
          week: true,
          month: true,
          agenda: true,
        }}
      />
    </div>
  )
}
