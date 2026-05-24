'use client'

import { Routes } from '@constants/routes'
import { Typography } from '@ui/atoms'
import { usePathname, useRouter, useSelectedLayoutSegment } from 'next/navigation'

const titles = [
  {
    code: Routes.Profile,
    label: 'profile',
  },
] as const

export const Header = () => {
  const router = useRouter()
  const pathname = usePathname()
  const segment = useSelectedLayoutSegment()

  const title = titles.find((el) => el.code === segment)

  const changeLocale = (nextLocale: string) => {
    const segments = pathname.split('/')

    segments[1] = nextLocale

    router.push(segments.join('/'))
  }

  return (
    <header className="flex items-center justify-between">
      {title?.label && <Typography variant="h1">{title.label}</Typography>}
    </header>
  )
}
