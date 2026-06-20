'use client'

import { LogoutButton } from './logout-button'

import { useGetProfile } from '@/shared/api/profile-api/hooks'
import { useLocalizedPath, useResolvedWorkspaceTheme } from '@/shared/hooks'
import { cn } from '@/shared/utils'
import { toggleNavbarEventName } from '@constants/events'
import { Routes } from '@constants/routes'
import { useDictionary } from '@contexts/dictionary-context'
import { CalendarDays, Menu, Settings, Users } from 'lucide-react'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import { useEffect, useState } from 'react'

const restrictedRoutes = [Routes.Login, Routes.Register] as string[]

const items = [
  {
    icon: <CalendarDays className="size-6" />,
    name: 'schedule',
    link: Routes.Profile,
  },
  {
    icon: <Users className="size-6" />,
    name: 'friends',
    link: Routes.Friends,
  },
  {
    icon: <Settings className="size-6" />,
    name: 'profile',
    link: Routes.Settings,
  },
] as const

type NavbarProfile = {
  avatarUrl?: string | null
  email?: string | null
  firstName?: string | null
  lastName?: string | null
}

const buildProfileLabel = (profile: NavbarProfile | null) => {
  const name = [profile?.firstName, profile?.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ')

  return name || profile?.email || 'Profile'
}

const buildProfileInitials = (profile: NavbarProfile | null) => {
  const nameParts = [profile?.firstName, profile?.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)

  if (nameParts.length) {
    return nameParts
      .slice(0, 2)
      .map((part) => part?.[0]?.toUpperCase())
      .join('')
  }

  return (profile?.email?.[0] ?? 'P').toUpperCase()
}

export const Navbar = () => {
  const toLocalized = useLocalizedPath()
  const [open, setOpen] = useState(true)
  const { workspaceThemeClass } = useResolvedWorkspaceTheme()
  const { data } = useGetProfile()

  const segment = useSelectedLayoutSegment() ?? ''

  const dict = useDictionary().nav
  const profile = data?.ok ? data.data : null
  const profileEmail = profile?.email ?? ''
  const profileLabel = buildProfileLabel(profile)
  const profileInitials = buildProfileInitials(profile)

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
          <div className="flex flex-col items-center gap-2 pt-1 text-center">
            <NavbarProfileAvatar
              initials={profileInitials}
              label={profileLabel}
              src={profile?.avatarUrl}
            />
            <div
              className="min-h-5 w-full max-w-[164px] truncate px-1 text-xs font-semibold leading-5 text-[color:var(--muted-foreground)] desktop:max-w-[108px]"
              title={profileEmail}
            >
              {profileEmail}
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

type NavbarProfileAvatarProps = {
  initials: string
  label: string
  src?: string | null
}

function NavbarProfileAvatar({ initials, label, src }: NavbarProfileAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const avatarSrc = src && failedSrc !== src ? src : null

  return (
    <div className="workspace-panel-solid flex size-[96px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[32px] font-bold text-accent desktop:size-[84px] desktop:text-[28px]">
      {avatarSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarSrc}
          alt={label}
          className="size-full object-cover"
          onError={() => setFailedSrc(avatarSrc)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
