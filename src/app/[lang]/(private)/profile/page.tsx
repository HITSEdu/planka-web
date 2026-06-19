import { ScheduleDashboard } from './_ui/schedule-dashboard'

import { hasLocale } from '@/shared/config'
import { notFound } from 'next/navigation'

export default async function Profile({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params

  if (!hasLocale(lang)) notFound()

  return <ScheduleDashboard />
}
