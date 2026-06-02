'use client'

import { toggleNavbarEvent } from '@constants/events'
import { Routes } from '@constants/routes'
import { useDictionary } from '@contexts/dictionary-context'
import { Dropdown, Typography } from '@ui/atoms'
import { EnglishFlag, HamburgerMenu, RussianFlag } from '@ui/atoms/icons'
import { usePathname, useRouter, useSelectedLayoutSegment } from 'next/navigation'

const locales = [
  {
    code: 'en',
    label: 'English',
    icon: <EnglishFlag />,
  },
  {
    code: 'ru',
    label: 'Русский',
    icon: <RussianFlag />,
  },
] as const

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

  const dict = useDictionary().nav

  const title = titles.find((el) => el.code === segment)

  const currentLocale = locales.find((el) => el.code === pathname.split('/')[1]) ?? locales[0]

  const changeLocale = (nextLocale: string) => {
    const segments = pathname.split('/')

    segments[1] = nextLocale

    router.push(segments.join('/'))
  }

  const menuClickHandler = () => {
    document.dispatchEvent(toggleNavbarEvent)
  }

  return (
    <header className="flex items-start justify-between mt-2.25">
      <div className="flex flex-col">
        <HamburgerMenu className="mb-11.75 block desktop:hidden" onClick={menuClickHandler} />
        <Typography variant="h1">{title?.label && dict[title.label]}</Typography>
      </div>

      <Dropdown
        needHideLabel={true}
        reversed={true}
        label={currentLocale.label}
        icon={currentLocale.icon}
        variant="text"
        items={locales.map((item) => ({
          label: item.label,
          icon: item.icon,
          needHideLabel: true,
          onClick: () => changeLocale(item.code),
        }))}
      />
    </header>
  )
}
