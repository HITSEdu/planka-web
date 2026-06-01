'use client'

import { useLocalizedPath } from '@/shared/hooks'
import { cn } from '@/shared/utils'
import { toggleNavbarEventName } from '@constants/events'
import { Routes } from '@constants/routes'
import { useDictionary } from '@contexts/dictionary-context'
import { ChevronRight, UserMenu } from '@ui/atoms/icons'
import Image from 'next/image'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import { useEffect, useState } from 'react'

const restrictedRoutes = [Routes.Login, Routes.Register] as string[]

const items = [
  {
    icon: <UserMenu />,
    name: 'profile',
    link: Routes.Profile,
  },
] as const

const OPEN_WIDTH = 'min-w-[280px] w-[280px]'
const CLOSED_WIDTH = 'min-w-0 w-0 desktop:min-w-[118px] desktop:w-[118px]'

export const Navbar = () => {
  const toLocalized = useLocalizedPath()
  const [open, setOpen] = useState(true)

  const segment = useSelectedLayoutSegment() ?? ''

  const dict = useDictionary().nav

  const toggle = () => setOpen((prev) => !prev)

  useEffect(() => {
    document.addEventListener(toggleNavbarEventName, toggle)

    return () => {
      document.removeEventListener(toggleNavbarEventName, toggle)
    }
  }, [])

  const needToShow = !restrictedRoutes.includes(segment)

  if (!needToShow) return null

  return (
    <>
      <div
        className={cn(
          `
            fixed inset-0 z-40 bg-black/50 transition-opacity
            desktop:hidden
          `,
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={toggle}
      />

      <div
        className={cn(
          `
            hidden
            desktop:flex
            withTransition
            desktop:mr-8.5 desktop-1920:mr-20.5
          `,
          open ? OPEN_WIDTH : CLOSED_WIDTH,
        )}
      />

      <aside
        className={cn(
          `
            fixed left-0 top-0 z-50 h-full
            bg-nav-background
            withTransition`,
          open ? OPEN_WIDTH : `${CLOSED_WIDTH} overflow-hidden desktop:overflow-visible`,
        )}
      >
        <button
          className="
            absolute -right-3 top-8.5
            bg-accent rounded-full flexCenter
          "
          onClick={toggle}
        >
          <ChevronRight
            width={26}
            height={26}
            className={cn('withTransition text-nav-background', open && 'rotate-180')}
          />
        </button>

        <nav className="h-full">
          <div className="h-38 flex justify-center pt-4 items-start">
              <Image
                src={'TODO'}
                alt="avatar"
                width={65}
                height={65}
                loading="eager"
                className="rounded-full object-contain"
              />
          </div>

          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li
                key={item.link}
                className={cn(
                  segment === item.link && 'border-l-[3px] border-accent text-accent bg-accent/10',
                )}
              >
                <Link
                  href={toLocalized(item.link)}
                  className={cn(
                    'flex items-center withTransition gap-3 rounded-lg py-1 pl-8 hover:bg-black/5',
                    !open && 'translate-x-1.75',
                  )}
                >
                  <span className="shrink-0">{item.icon}</span>

                  <div
                    className={cn(
                      `
      overflow-hidden
      withTransition
    `,
                      open ? 'opacity-100 ml-0' : 'max-w-0 opacity-0 -ml-1',
                    )}
                  >
                    <span className="whitespace-nowrap">{dict[item.name]}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}
