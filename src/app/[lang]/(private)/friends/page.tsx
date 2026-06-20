import { FriendsWorkspace } from './_ui/friends-workspace'

import { hasLocale } from '@/shared/config'
import { notFound } from 'next/navigation'

export default async function FriendsPage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params

  if (!hasLocale(lang)) notFound()

  return <FriendsWorkspace />
}
