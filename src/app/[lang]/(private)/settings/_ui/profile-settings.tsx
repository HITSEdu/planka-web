'use client'

import type { ProfileType, ProfileUpdatePayloadType } from '@dto'

import { useResolvedWorkspaceTheme } from '@/shared/hooks'
import { useLogout } from '@actions/auth-actions'
import { useGetProfile, useUpdateProfile } from '@api/profile-api/hooks'
import { Status } from '@constants/api'
import { useDictionary, useLocale } from '@contexts/dictionary-context'
import { cn } from '@utils'
import {
  CalendarDays,
  ImagePlus,
  Mail,
  Moon,
  RotateCcw,
  Save,
  ShieldUser,
  SunMedium,
  Trash2,
  UserRound,
} from 'lucide-react'
import NextImage from 'next/image'
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

type ProfileForm = {
  firstName: string
  lastName: string
  patronymic: string
  birthDate: string
  gender: ProfileType['gender']
  avatarUrl: string
}

const emptyForm: ProfileForm = {
  firstName: '',
  lastName: '',
  patronymic: '',
  birthDate: '',
  gender: 'NotDefined',
  avatarUrl: '',
}

const avatarCanvasSize = 320
const maxAvatarFileBytes = 5 * 1024 * 1024

const fieldClassName =
  'min-h-12 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted-foreground)] focus:bg-[color:var(--surface-muted)] disabled:opacity-70'

const genderOptions = [
  { value: 'NotDefined', ru: 'Не указан', en: 'Not specified' },
  { value: 'Female', ru: 'Женский', en: 'Female' },
  { value: 'Male', ru: 'Мужской', en: 'Male' },
] as const

const getPageText = (locale: 'ru' | 'en') =>
  locale === 'ru'
    ? {
        description: 'Данные аккаунта и публичный профиль Planka.',
        avatar: 'Аватар',
        avatarUrl: 'URL аватарки',
        chooseFile: 'Загрузить',
        removeAvatar: 'Убрать',
        firstName: 'Имя',
        lastName: 'Фамилия',
        patronymic: 'Отчество',
        fullName: 'Полное имя',
        empty: 'Не указано',
        loading: 'Загружаем профиль...',
        error: 'Не удалось загрузить профиль.',
        save: 'Сохранить',
        saving: 'Сохраняем...',
        reset: 'Сбросить',
        saved: 'Профиль сохранен',
        saveError: 'Не удалось сохранить профиль',
        fileError: 'Не удалось прочитать изображение',
        fileTooLarge: 'Файл должен быть меньше 5 МБ',
      }
    : {
        description: 'Account details and public Planka profile.',
        avatar: 'Avatar',
        avatarUrl: 'Avatar URL',
        chooseFile: 'Upload',
        removeAvatar: 'Remove',
        firstName: 'First name',
        lastName: 'Last name',
        patronymic: 'Middle name',
        fullName: 'Full name',
        empty: 'Not specified',
        loading: 'Loading profile...',
        error: 'Could not load profile.',
        save: 'Save',
        saving: 'Saving...',
        reset: 'Reset',
        saved: 'Profile saved',
        saveError: 'Could not save profile',
        fileError: 'Could not read image',
        fileTooLarge: 'File must be under 5 MB',
      }

const profileToForm = (profile: ProfileType): ProfileForm => ({
  firstName: profile.firstName ?? '',
  lastName: profile.lastName ?? '',
  patronymic: profile.patronymic ?? '',
  birthDate: profile.birthDate ?? '',
  gender: profile.gender,
  avatarUrl: profile.avatarUrl ?? '',
})

const nullableText = (value: string) => {
  const trimmed = value.trim()

  return trimmed ? trimmed : null
}

const formToPayload = (form: ProfileForm): ProfileUpdatePayloadType => ({
  firstName: nullableText(form.firstName),
  lastName: nullableText(form.lastName),
  patronymic: nullableText(form.patronymic),
  birthDate: form.birthDate,
  gender: form.gender,
  avatarUrl: nullableText(form.avatarUrl),
})

const buildFullName = (form: ProfileForm, empty: string) => {
  const parts = [form.lastName, form.firstName, form.patronymic]
    .map((part) => part.trim())
    .filter(Boolean)

  return parts.length ? parts.join(' ') : empty
}

const buildInitials = (form: ProfileForm, email: string | null | undefined) => {
  const parts = [form.firstName, form.lastName].map((part) => part.trim()).filter(Boolean)

  if (parts.length) {
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')
  }

  return (email?.[0] ?? 'P').toUpperCase()
}

async function avatarFileToDataUrl(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Unsupported file type')
  }

  if (file.size > maxAvatarFileBytes) {
    throw new Error('File is too large')
  }

  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await loadImage(objectUrl)
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Canvas is not available')
    }

    const sourceSize = Math.min(image.naturalWidth, image.naturalHeight)
    const sourceX = (image.naturalWidth - sourceSize) / 2
    const sourceY = (image.naturalHeight - sourceSize) / 2

    canvas.width = avatarCanvasSize
    canvas.height = avatarCanvasSize
    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      avatarCanvasSize,
      avatarCanvasSize,
    )

    return canvas.toDataURL('image/jpeg', 0.88)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Image failed to load'))
    image.src = src
  })
}

export function ProfileSettings() {
  const locale = useLocale()
  const dict = useDictionary().profile.personalInfo
  const text = getPageText(locale)
  const didHandleUnauthorized = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { currentTheme, setTheme, workspaceThemeClass } = useResolvedWorkspaceTheme()
  const { mutate: logout } = useLogout()
  const { data, isLoading } = useGetProfile()
  const updateProfile = useUpdateProfile()
  const [draftForm, setDraftForm] = useState<ProfileForm | null>(null)
  const [isReadingAvatar, setIsReadingAvatar] = useState(false)

  useEffect(() => {
    if (!data?.ok || data.error !== Status.Unauthorized || didHandleUnauthorized.current) {
      return
    }

    didHandleUnauthorized.current = true
    logout()
  }, [data, logout])

  const profile = data?.ok ? data.data : null
  const profileForm = useMemo(() => (profile ? profileToForm(profile) : emptyForm), [profile])
  const form = draftForm ?? profileForm
  const isDirty = draftForm !== null

  const fullName = useMemo(() => buildFullName(form, text.empty), [form, text.empty])
  const initials = useMemo(() => buildInitials(form, profile?.email), [form, profile?.email])

  const updateField = <TField extends keyof ProfileForm>(
    field: TField,
    value: ProfileForm[TField],
  ) => {
    setDraftForm((current) => ({
      ...(current ?? form),
      [field]: value,
    }))
  }

  const resetForm = () => {
    setDraftForm(null)
  }

  const submitProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    updateProfile.mutate(formToPayload(form), {
      onSuccess: () => {
        setDraftForm(null)
        toast.success(text.saved)
      },
      onError: (error) => {
        toast.error(error.message || text.saveError)
      },
    })
  }

  const handleAvatarFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    try {
      setIsReadingAvatar(true)
      const avatarUrl = await avatarFileToDataUrl(file)
      updateField('avatarUrl', avatarUrl)
    } catch (error) {
      toast.error(
        error instanceof Error && error.message === 'File is too large'
          ? text.fileTooLarge
          : text.fileError,
      )
    } finally {
      setIsReadingAvatar(false)
    }
  }

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
      <NextImage
        src="/assets/auth/register/blue-flower.png"
        alt=""
        width={1472}
        height={832}
        className="pointer-events-none absolute -right-20 top-0 z-0 hidden w-[36vw] min-w-[360px] max-w-[620px] opacity-90 tablet:block"
        priority
        unoptimized
      />
      <NextImage
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
              aria-label="Светлая тема"
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
              aria-label="Темная тема"
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

        <form
          className="workspace-panel rounded-[34px] px-6 py-6 tablet:px-8 desktop:px-10 desktop:py-8"
          onSubmit={submitProfile}
        >
          <div className="mb-6 flex items-center gap-3 text-[color:var(--foreground)]">
            <ShieldUser className="size-7 text-accent" />
            <h2 className="font-raleway text-[28px] font-bold leading-none tablet:text-[34px]">
              {dict.root}
            </h2>
          </div>

          <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
            <aside className="workspace-panel-solid rounded-[28px] p-5">
              <div className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                <UserRound className="size-4" />
                {text.avatar}
              </div>

              <div className="flex flex-col items-center gap-5 text-center">
                <AvatarPreview initials={initials} label={fullName} src={form.avatarUrl} />

                <div>
                  <div className="text-xl font-semibold text-[color:var(--foreground)]">
                    {fullName}
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-2 text-sm text-[color:var(--muted-foreground)]">
                    <Mail className="size-4" />
                    {profile.email}
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFile}
              />

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <button
                  type="button"
                  className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-accent px-4 text-sm font-semibold text-primary transition hover:bg-button-primary-hover disabled:opacity-60"
                  disabled={isReadingAvatar || updateProfile.isPending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="size-4" />
                  {text.chooseFile}
                </button>

                <button
                  type="button"
                  className="workspace-soft-button flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold disabled:opacity-60"
                  disabled={!form.avatarUrl || isReadingAvatar || updateProfile.isPending}
                  onClick={() => updateField('avatarUrl', '')}
                >
                  <Trash2 className="size-4" />
                  {text.removeAvatar}
                </button>
              </div>

              <label className="mt-5 flex flex-col gap-2 text-sm font-medium text-[color:var(--muted-foreground)]">
                {text.avatarUrl}
                <input
                  value={form.avatarUrl}
                  onChange={(event) => updateField('avatarUrl', event.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className={fieldClassName}
                />
              </label>
            </aside>

            <div className="grid gap-4 xl:grid-cols-2">
              <FormField
                label={text.lastName}
                value={form.lastName}
                onChange={(value) => updateField('lastName', value)}
              />
              <FormField
                label={text.firstName}
                value={form.firstName}
                onChange={(value) => updateField('firstName', value)}
              />
              <FormField
                label={text.patronymic}
                value={form.patronymic}
                onChange={(value) => updateField('patronymic', value)}
              />

              <label className="flex flex-col gap-2 text-sm font-medium text-[color:var(--muted-foreground)]">
                {dict.dob}
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--muted-foreground)]" />
                  <input
                    type="date"
                    value={form.birthDate}
                    onChange={(event) => updateField('birthDate', event.target.value)}
                    className={cn(fieldClassName, 'pl-11')}
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-[color:var(--muted-foreground)]">
                {dict.gender}
                <select
                  value={form.gender}
                  onChange={(event) =>
                    updateField('gender', event.target.value as ProfileType['gender'])
                  }
                  className={fieldClassName}
                >
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option[locale]}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3">
                <div className="mb-1 text-sm font-medium text-[color:var(--muted-foreground)]">
                  {text.fullName}
                </div>
                <div className="min-h-7 text-lg font-semibold text-[color:var(--foreground)]">
                  {fullName}
                </div>
              </div>

              <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 xl:col-span-2">
                <div className="mb-1 text-sm font-medium text-[color:var(--muted-foreground)]">
                  {dict.email}
                </div>
                <div className="min-h-7 break-all text-lg font-semibold text-[color:var(--foreground)]">
                  {profile.email ?? text.empty}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-[color:var(--divider)] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="workspace-soft-button flex h-12 items-center justify-center gap-2 rounded-2xl px-5 font-semibold disabled:opacity-60"
              disabled={!isDirty || updateProfile.isPending}
              onClick={resetForm}
            >
              <RotateCcw className="size-4" />
              {text.reset}
            </button>

            <button
              type="submit"
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent px-5 font-semibold text-primary transition hover:bg-button-primary-hover disabled:opacity-60"
              disabled={!isDirty || updateProfile.isPending || isReadingAvatar}
            >
              <Save className="size-4" />
              {updateProfile.isPending ? text.saving : text.save}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

type AvatarPreviewProps = {
  initials: string
  label: string
  src: string
}

function AvatarPreview({ initials, label, src }: AvatarPreviewProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const shouldShowImage = src && failedSrc !== src

  return (
    <div className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[42px] font-bold text-accent shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
      {shouldShowImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={label}
          className="size-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}

type FormFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

function FormField({ label, value, onChange }: FormFieldProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-[color:var(--muted-foreground)]">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={120}
        className={fieldClassName}
      />
    </label>
  )
}
