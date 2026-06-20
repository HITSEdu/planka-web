'use client'

import { LogoutButton } from './logout-button'

import { useLocalizedPath } from '@/shared/hooks'
import { cn } from '@/shared/utils'
import { toggleNavbarEventName } from '@constants/events'
import { Routes } from '@constants/routes'
import { useDictionary } from '@contexts/dictionary-context'
import { CalendarDays, Menu, Settings } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const restrictedRoutes = [Routes.Login, Routes.Register] as string[]

const items = [
  {
    icon: <CalendarDays className="size-6" />,
    name: 'schedule',
    link: Routes.Profile,
  },
  {
    icon: <Settings className="size-6" />,
    name: 'profile',
    link: Routes.Settings,
  },
] as const

export const Navbar = () => {
  const toLocalized = useLocalizedPath()
  const [open, setOpen] = useState(true)
  const { resolvedTheme } = useTheme()

  const segment = useSelectedLayoutSegment() ?? ''

  const dict = useDictionary().nav

  const toggle = () => setOpen((prev) => !prev)
  const workspaceThemeClass = resolvedTheme === 'dark' ? 'workspace-dark' : 'workspace-light'

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
      <button
        type="button"
        className={cn(
          workspaceThemeClass,
          'fixed left-4 top-6 z-[60] flex size-12 items-center justify-center rounded-full border border-white/20 bg-[color:var(--surface-elevated)] text-[color:var(--foreground)] shadow-[0_20px_45px_rgba(4,10,32,0.28)] backdrop-blur-xl transition-opacity duration-300 desktop:hidden',
          open ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100',
        )}
        onClick={toggle}
      >
        <Menu className="size-5" />
      </button>

      <div
        className={cn(
          `
            fixed inset-0 z-40 bg-black/60 transition-opacity
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
            desktop:mr-8.5 desktop-1920:mr-20.5
          `,
          'desktop:min-w-[148px] desktop:w-[148px]',
        )}
      />

      <aside
        className={cn(
          workspaceThemeClass,
          'workspace-sidebar fixed bottom-4 left-4 top-4 z-50 w-[228px] rounded-[32px] p-4 text-[color:var(--foreground)] transition-transform duration-300 ease-linear',
          'desktop:w-[148px] desktop:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-[125%]',
        )}
      >
        <button
          type="button"
          className="absolute -right-3 top-8 flex size-10 items-center justify-center rounded-full border border-white/20 bg-[color:var(--surface-elevated)] text-[color:var(--foreground)] desktop:hidden"
          onClick={toggle}
        >
          <Menu className="size-5" />
        </button>

        <nav className="flex h-full flex-col gap-6">
          <div className="flex justify-center pt-1">
            <div className="workspace-panel-solid relative h-[96px] w-[96px] overflow-hidden rounded-[28px] border border-white/10 desktop:h-[84px] desktop:w-[84px]">
              <Image
                src="/assets/auth/login/blue-blur-flower.png"
                alt=""
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          </div>

          <ul className="flex flex-1 flex-col gap-3">
            {items.map((item) => (
              <li key={item.link}>
                <Link
                  href={toLocalized(item.link)}
                  data-active={segment === item.link}
                  className={cn(
                    'workspace-nav-link flex h-[72px] items-center gap-4 rounded-[24px] border border-transparent px-4',
                    'desktop:justify-center desktop:px-0',
                  )}
                  title={dict[item.name]}
                >
                  <span className="shrink-0 rounded-[20px] border border-current/20 p-3">
                    {item.icon}
                  </span>
                  <span className="text-sm font-semibold desktop:hidden">{dict[item.name]}</span>
                </Link>
              </li>
            ))}
            <LogoutButton />
          </ul>
        </nav>
      </aside>
    </>
  )
}
