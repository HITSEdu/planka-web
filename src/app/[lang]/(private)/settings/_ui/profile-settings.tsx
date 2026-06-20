'use client'

import { useLogout } from '@actions/auth-actions'
import { useGetProfile } from '@api/profile-api/hooks'
import { Status } from '@constants/api'
import { useDictionary, useLocale } from '@contexts/dictionary-context'
import { cn } from '@utils'
import { CalendarDays, Mail, Moon, ShieldUser, SunMedium, UserRound } from 'lucide-react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useMemo, useRef } from 'react'

const formatBirthDate = (value: string, locale: 'ru' | 'en') => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

const getGenderLabel = (value: 'Male' | 'Female' | 'NotDefined', locale: 'ru' | 'en') => {
  const labels = {
    ru: {
      Male: 'Мужской',
      Female: 'Женский',
      NotDefined: 'Не указан',
    },
    en: {
      Male: 'Male',
      Female: 'Female',
      NotDefined: 'Not specified',
    },
  } as const

  return labels[locale][value]
}

const getPageText = (locale: 'ru' | 'en') =>
  locale === 'ru'
    ? {
        description:
          'Здесь собраны основные данные аккаунта. Экран уже готов как точка входа для будущего редактирования профиля.',
        firstName: 'Имя',
        lastName: 'Фамилия',
        patronymic: 'Отчество',
        fullName: 'Полное имя',
        empty: 'Не указано',
        loading: 'Загружаем профиль...',
        error: 'Не удалось загрузить профиль.',
      }
    : {
        description:
          'This page gathers the main account details and serves as the entry point for future profile editing.',
        firstName: 'First name',
        lastName: 'Last name',
        patronymic: 'Middle name',
        fullName: 'Full name',
        empty: 'Not specified',
        loading: 'Loading profile...',
        error: 'Could not load profile.',
      }

const fieldClassName = 'workspace-panel-solid rounded-[28px] p-5'

export function ProfileSettings() {
  const locale = useLocale()
  const dict = useDictionary().profile.personalInfo
  const text = getPageText(locale)
  const didHandleUnauthorized = useRef(false)
  const { resolvedTheme, setTheme } = useTheme()
  const { mutate: logout } = useLogout()
  const { data, isLoading } = useGetProfile()
  const currentTheme = resolvedTheme === 'dark' ? 'dark' : 'light'
  const workspaceThemeClass = currentTheme === 'dark' ? 'workspace-dark' : 'workspace-light'

  useEffect(() => {
    if (!data?.ok || data.error !== Status.Unauthorized || didHandleUnauthorized.current) {
      return
    }

    didHandleUnauthorized.current = true
    logout()
  }, [data, logout])

  const profile = data?.ok ? data.data : null
  const fullName = useMemo(() => {
    if (!profile) {
      return text.empty
    }

    const parts = [profile.lastName, profile.firstName, profile.patronymic].filter(Boolean)

    return parts.length ? parts.join(' ') : text.empty
  }, [profile, text.empty])

  if (isLoading) {
    return (
      <section
        className={cn(
          workspaceThemeClass,
          'workspace-screen -mx-4 -my-4.75 flex min-h-screen items-center justify-center px-5 py-8 tablet-600:-mx-8 tablet:-mx-12.5 tablet:px-10 desktop:my-[-45px] desktop:ml-0 desktop:mr-[-152px] desktop:px-12 desktop:py-14 desktop-1920:mr-[-200px]',
        )}
      >
        <div className="workspace-panel-solid flex min-h-[360px] w-full max-w-[980px] items-center justify-center rounded-[32px] text-lg font-medium text-[color:var(--muted-foreground)]">
          {text.loading}
        </div>
      </section>
    )
  }

  if (!profile) {
    return (
      <section
        className={cn(
          workspaceThemeClass,
          'workspace-screen -mx-4 -my-4.75 min-h-screen px-5 py-8 tablet-600:-mx-8 tablet:-mx-12.5 tablet:px-10 desktop:my-[-45px] desktop:ml-0 desktop:mr-[-152px] desktop:px-12 desktop:py-14 desktop-1920:mr-[-200px]',
        )}
      >
        <div className="rounded-[28px] border border-amber-300/50 bg-amber-100/70 px-6 py-5 text-sm text-amber-950 dark:bg-amber-500/10 dark:text-amber-100">
          {text.error}
          {data && !data.ok ? ` ${data.error}` : ''}
        </div>
      </section>
    )
  }

  return (
    <section
      className={cn(
        workspaceThemeClass,
        'workspace-screen -mx-4 -my-4.75 min-h-screen px-5 py-8 text-[color:var(--foreground)] tablet-600:-mx-8 tablet:-mx-12.5 tablet:px-10 desktop:my-[-45px] desktop:ml-0 desktop:mr-[-152px] desktop:px-12 desktop:py-14 desktop-1920:mr-[-200px]',
      )}
    >
      <Image
        src="/assets/auth/register/blue-flower.png"
        alt=""
        width={1472}
        height={832}
        className="pointer-events-none absolute -right-20 top-0 z-0 hidden w-[36vw] min-w-[360px] max-w-[620px] opacity-90 tablet:block"
        priority
        unoptimized
      />
      <Image
        src="/assets/auth/register/white-flower.png"
        alt=""
        width={1450}
        height={1600}
        className="pointer-events-none absolute bottom-0 left-0 z-0 hidden w-[28vw] min-w-[340px] max-w-[480px] opacity-25 desktop:block"
        priority
        unoptimized
      />

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[1540px] flex-col gap-8">
        <header className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-5">
            <span className="block font-syncopate text-xs uppercase tracking-[0.34em] text-[color:var(--muted-foreground)]">
              Planka
            </span>

            <div className="space-y-4">
              <h1 className="font-raleway text-[44px] font-bold leading-none tablet:text-[58px] desktop:text-[68px]">
                Профиль
              </h1>
              <p className="max-w-[720px] text-base leading-7 text-[color:var(--muted-foreground)] tablet:text-lg">
                {text.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className={cn(
                'workspace-soft-button flex size-12 items-center justify-center rounded-full',
                currentTheme === 'light' && 'ring-2 ring-white/50',
              )}
              onClick={() => setTheme('light')}
              title="Светлая тема"
            >
              <SunMedium className="size-5" />
            </button>

            <button
              type="button"
              className={cn(
                'workspace-soft-button flex size-12 items-center justify-center rounded-full',
                currentTheme === 'dark' && 'ring-2 ring-white/50',
              )}
              onClick={() => setTheme('dark')}
              title="Темная тема"
            >
              <Moon className="size-5" />
            </button>
          </div>
        </header>

        <div className="workspace-panel rounded-[34px] px-6 py-6 tablet:px-8 desktop:px-10 desktop:py-8">
          <div className="mb-6 flex items-center gap-3 text-[color:var(--foreground)]">
            <ShieldUser className="size-7 text-accent" />
            <h2 className="font-raleway text-[28px] font-bold leading-none tablet:text-[34px]">
              {dict.root}
            </h2>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className={fieldClassName}>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                <UserRound className="size-4" />
                {dict.root}
              </div>

              <div className="space-y-4">
                <Field label={text.lastName} value={profile.lastName ?? text.empty} />
                <Field label={text.firstName} value={profile.firstName ?? text.empty} />
                <Field label={text.patronymic} value={profile.patronymic ?? text.empty} />
                <Field label={text.fullName} value={fullName} />
              </div>
            </div>

            <div className="grid gap-4">
              <div className={fieldClassName}>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                  <Mail className="size-4" />
                  {dict.email}
                </div>

                <div className="text-lg font-semibold text-[color:var(--foreground)]">
                  {profile.email ?? text.empty}
                </div>
              </div>

              <div className={fieldClassName}>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                  <UserRound className="size-4" />
                  {dict.gender}
                </div>

                <div className="text-lg font-semibold text-[color:var(--foreground)]">
                  {getGenderLabel(profile.gender, locale)}
                </div>
              </div>

              <div className={fieldClassName}>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                  <CalendarDays className="size-4" />
                  {dict.dob}
                </div>

                <div className="text-lg font-semibold text-[color:var(--foreground)]">
                  {formatBirthDate(profile.birthDate, locale)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

type FieldProps = {
  label: string
  value: string
}

function Field({ label, value }: FieldProps) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
        {label}
      </div>

      <div className="text-lg font-semibold text-[color:var(--foreground)]">{value}</div>
    </div>
  )
}
