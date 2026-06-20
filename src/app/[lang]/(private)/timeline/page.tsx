import { ScheduleDashboard } from '../profile/_ui/schedule-dashboard'

import { hasLocale } from '@/shared/config'
import { notFound } from 'next/navigation'

export default async function TimelinePage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params

  if (!hasLocale(lang)) notFound()

  return <ScheduleDashboard view="timeline" />
}
