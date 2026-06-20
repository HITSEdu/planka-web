import { ProfileSettings } from './_ui/profile-settings'

import { hasLocale } from '@/shared/config'
import { notFound } from 'next/navigation'

export default async function SettingsPage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params

  if (!hasLocale(lang)) notFound()

  return <ProfileSettings />
}
