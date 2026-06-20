'use client'

import ProfileCalendar from '../../../_ui/calendar'
import ProfileTimeline from '../../../_ui/timeline'

import type { EventType, TagType } from '@dto'

import { useLogout } from '@actions/auth-actions'
import { useCreateEvent, useDeleteEvent, useGetEvents, useUpdateEvent } from '@api/events-api/hooks'
import { useCreateTag, useDeleteTag, useGetTags, useUpdateTag } from '@api/tags-api/hooks'
import { Status } from '@constants/api'
import { Routes } from '@constants/routes'
import { useLocalizedPath } from '@hooks/use-localized-path'
import { ColorPicker } from '@ui/molecules'
import { cn } from '@utils'
import {
  Moon,
  Pencil,
  Plus,
  Share2,
  SlidersHorizontal,
  SquareStack,
  SunMedium,
  Tag,
  Trash2,
  Waypoints,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

const modalFieldClassName =
  'min-h-12 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-[color:var(--foreground)] outline-none transition focus:bg-[color:var(--surface-muted)]'

const iconButtonClassName =
  'flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-muted)] disabled:opacity-50'

const themeToggleButtonClassName =
  'flex size-12 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] transition hover:bg-[color:var(--surface-muted)]'

type ScheduleView = 'calendar' | 'timeline'

type Props = {
  view: ScheduleView
}

const toDateTimeInputValue = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0')

  return [
    date.getFullYear(),
    '-',
    pad(date.getMonth() + 1),
    '-',
    pad(date.getDate()),
    'T',
    pad(date.getHours()),
    ':',
    pad(date.getMinutes()),
  ].join('')
}

const eventDateInputValue = (value: string | null, fallback: string) =>
  toDateTimeInputValue(new Date(value ?? fallback))

const addHours = (value: string, hours: number) => {
  const date = new Date(value)

  date.setHours(date.getHours() + hours)

  return toDateTimeInputValue(date)
}

export const ScheduleDashboard = ({ view }: Props) => {
  const toLocalized = useLocalizedPath()
  const { resolvedTheme, setTheme } = useTheme()
  const [selectedTagName, setSelectedTagName] = useState<string | undefined>()
  const [isTagModalOpen, setIsTagModalOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<TagType | null>(null)
  const [tagName, setTagName] = useState('')
  const [tagColor, setTagColor] = useState<string | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null)
  const [eventTitle, setEventTitle] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [eventStartsAt, setEventStartsAt] = useState('')
  const [eventEndsAt, setEventEndsAt] = useState('')
  const [eventFocus, setEventFocus] = useState(0)
  const [eventTagIds, setEventTagIds] = useState<string[]>([])
  const didHandleUnauthorized = useRef(false)

  const { mutate: logout } = useLogout()
  const {
    data: tags = [],
    isLoading: isTagsLoading,
    isError: isTagsError,
    error: tagsError,
  } = useGetTags()
  const createTag = useCreateTag()
  const updateTag = useUpdateTag()
  const deleteTag = useDeleteTag()
  const {
    data: events = [],
    isLoading,
    isError,
    error,
  } = useGetEvents({ tagName: selectedTagName })
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()
  const visibleEvents = isError ? [] : events

  const selectedTag = useMemo(
    () => tags.find((tag) => tag.name === selectedTagName),
    [selectedTagName, tags],
  )

  const isTagMutationPending = createTag.isPending || updateTag.isPending || deleteTag.isPending
  const isEventMutationPending =
    createEvent.isPending || updateEvent.isPending || deleteEvent.isPending
  const currentTheme = resolvedTheme === 'dark' ? 'dark' : 'light'
  const workspaceThemeClass = currentTheme === 'dark' ? 'workspace-dark' : 'workspace-light'

  useEffect(() => {
    const tagsUnauthorized =
      isTagsError && tagsError instanceof Error && tagsError.message === Status.Unauthorized
    const eventsUnauthorized =
      isError && error instanceof Error && error.message === Status.Unauthorized

    if (!didHandleUnauthorized.current && (tagsUnauthorized || eventsUnauthorized)) {
      didHandleUnauthorized.current = true
      logout()
    }
  }, [error, isError, isTagsError, logout, tagsError])

  const openCreateTagModal = () => {
    setEditingTag(null)
    setTagName('')
    setTagColor(null)
    setIsTagModalOpen(true)
  }

  const openEditTagModal = (tag: TagType) => {
    setEditingTag(tag)
    setTagName(tag.name)
    setTagColor(tag.color)
    setIsTagModalOpen(true)
  }

  const submitTag = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const name = tagName.trim()

    if (!name) {
      return
    }

    if (!tagColor) {
      toast.error('Выберите цвет тэга')
      return
    }

    const dto = {
      name,
      color: tagColor,
    }

    if (editingTag) {
      updateTag.mutate(
        { id: editingTag.id, dto },
        {
          onSuccess: () => {
            setSelectedTagName(name)
            setIsTagModalOpen(false)
          },
          onError: () => toast.error('Не удалось обновить тэг'),
        },
      )
      return
    }

    createTag.mutate(dto, {
      onSuccess: () => {
        setTagName('')
        setTagColor(null)
        setIsTagModalOpen(false)
      },
      onError: () => toast.error('Не удалось создать тэг'),
    })
  }

  const deleteSelectedTag = () => {
    if (!selectedTag) {
      return
    }

    deleteTag.mutate(selectedTag.id, {
      onSuccess: () => {
        setSelectedTagName(undefined)
      },
      onError: () => toast.error('Не удалось удалить тэг'),
    })
  }

  const openCreateEventModal = () => {
    const start = new Date()

    start.setMinutes(0, 0, 0)
    start.setHours(start.getHours() + 1)

    const startValue = toDateTimeInputValue(start)

    setEditingEvent(null)
    setEventTitle('')
    setEventDescription('')
    setEventStartsAt(startValue)
    setEventEndsAt(addHours(startValue, 1))
    setEventFocus(0)
    setEventTagIds(selectedTag ? [selectedTag.id] : [])
    setIsEventModalOpen(true)
  }

  const openEditEventModal = (event: EventType) => {
    const startValue = eventDateInputValue(event.starts_at, event.created_at)

    setEditingEvent(event)
    setEventTitle(event.title)
    setEventDescription(event.description ?? '')
    setEventStartsAt(startValue)
    setEventEndsAt(
      event.ends_at
        ? eventDateInputValue(event.ends_at, event.created_at)
        : addHours(startValue, 1),
    )
    setEventFocus(event.focus)
    setEventTagIds(event.tags.map((tag) => tag.id))
    setIsEventModalOpen(true)
  }

  const toggleEventTag = (tagID: string) => {
    setEventTagIds((currentTagIDs) =>
      currentTagIDs.includes(tagID)
        ? currentTagIDs.filter((currentTagID) => currentTagID !== tagID)
        : [...currentTagIDs, tagID],
    )
  }

  const submitEvent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const title = eventTitle.trim()

    if (!title) {
      toast.error('Введите название события')
      return
    }

    const startsAt = eventStartsAt ? new Date(eventStartsAt).toISOString() : null
    const endsAt = eventEndsAt ? new Date(eventEndsAt).toISOString() : null

    if (startsAt && endsAt && new Date(startsAt) > new Date(endsAt)) {
      toast.error('Дата начала должна быть раньше даты окончания')
      return
    }

    const dto = {
      title,
      description: eventDescription.trim() || null,
      starts_at: startsAt,
      ends_at: endsAt,
      focus: eventFocus,
      tag_ids: eventTagIds,
    }

    if (editingEvent) {
      updateEvent.mutate(
        { id: editingEvent.id, dto },
        {
          onSuccess: () => setIsEventModalOpen(false),
          onError: () => toast.error('Не удалось обновить событие'),
        },
      )
      return
    }

    createEvent.mutate(dto, {
      onSuccess: () => setIsEventModalOpen(false),
      onError: () => toast.error('Не удалось создать событие'),
    })
  }

  const deleteEditingEvent = () => {
    if (!editingEvent) {
      return
    }

    deleteEvent.mutate(editingEvent.id, {
      onSuccess: () => setIsEventModalOpen(false),
      onError: () => toast.error('Не удалось удалить событие'),
    })
  }

  const handleEventDateChange = useCallback(
    async ({ id, starts_at, ends_at }: { id: string; starts_at: string; ends_at: string }) => {
      const event = events.find((item) => item.id === id)

      if (!event) {
        throw new Error('Event not found')
      }

      try {
        await updateEvent.mutateAsync({
          id,
          dto: {
            title: event.title,
            description: event.description,
            starts_at,
            ends_at,
            focus: event.focus,
            tag_ids: event.tags.map((tag) => tag.id),
          },
        })
      } catch {
        toast.error('Не удалось сохранить новое время события')
        throw new Error('Failed to update event dates')
      }
    },
    [events, updateEvent],
  )

  return (
    <section
      className={cn(
        workspaceThemeClass,
        'workspace-screen -mx-4 -my-4.75 min-h-screen px-5 py-8 text-[color:var(--foreground)] tablet-600:-mx-8 tablet:-mx-12.5 tablet:px-10 desktop:my-[-45px] desktop:ml-0 desktop:mr-[-152px] desktop:px-12 desktop:py-14 desktop-1920:mr-[-200px]',
      )}
    >
      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[1680px] flex-col gap-8">
        <header className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-5">
            <span className="block font-syncopate text-xs uppercase tracking-[0.34em] text-[color:var(--muted-foreground)]">
              Planka
            </span>

            <div className="space-y-4">
              <h1 className="font-raleway text-[46px] font-bold leading-none text-[color:var(--foreground)] tablet:text-[64px] desktop:text-[76px]">
                Мое расписание
              </h1>
              <p className="max-w-[720px] text-base leading-7 text-[color:var(--muted-foreground)] tablet:text-lg">
                Дела, тэги и представления собраны в один рабочий экран, как в приватной части
                приложения, а не в отдельные разрозненные страницы.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              className={cn(
                themeToggleButtonClassName,
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
                themeToggleButtonClassName,
                currentTheme === 'dark' && 'ring-2 ring-white/50',
              )}
              onClick={() => setTheme('dark')}
              title="Темная тема"
            >
              <Moon className="size-5" />
            </button>

            <button
              type="button"
              className="flex items-center gap-2 rounded-[18px] bg-accent px-5 py-3 text-sm font-semibold text-primary transition hover:opacity-90"
              onClick={openCreateEventModal}
            >
              <Plus className="size-4" />
              Создать дело
            </button>

            <button
              type="button"
              className="workspace-outline-button flex items-center gap-3 rounded-[18px] px-6 py-3 text-lg font-semibold"
              onClick={() => toast.info('Совместный доступ к событиям добавим следующим шагом')}
            >
              <Share2 className="size-5" />
              Поделиться
            </button>
          </div>
        </header>

        <div className="workspace-panel rounded-[32px] px-5 py-6 tablet:px-7 desktop:px-10">
          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Tag className="size-7 text-[color:var(--foreground)]" />
                  <h2 className="font-raleway text-[34px] font-bold leading-none tablet:text-[42px]">
                    Тэги
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className={cn(
                      'workspace-chip inline-flex h-11 items-center rounded-full px-4 text-base font-medium transition',
                      !selectedTagName && 'ring-2 ring-white/70',
                    )}
                    onClick={() => setSelectedTagName(undefined)}
                  >
                    Все
                  </button>

                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      className={cn(
                        'workspace-chip inline-flex h-11 items-center gap-2 rounded-full pl-2 pr-4 text-base font-medium transition',
                        selectedTag?.id === tag.id && 'ring-2 ring-white/70',
                      )}
                      onClick={() => setSelectedTagName(tag.name)}
                    >
                      <span
                        className="size-6 shrink-0 rounded-full border border-white/20"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </button>
                  ))}

                  <button
                    type="button"
                    className={cn(
                      iconButtonClassName,
                      'workspace-soft-button h-11 w-11 rounded-full',
                    )}
                    aria-label="Создать тэг"
                    onClick={openCreateTagModal}
                    title="Создать тэг"
                  >
                    <Plus className="size-4" />
                  </button>

                  {selectedTag && (
                    <>
                      <button
                        type="button"
                        className={cn(
                          iconButtonClassName,
                          'workspace-soft-button h-11 w-11 rounded-full',
                        )}
                        aria-label="Редактировать тэг"
                        onClick={() => openEditTagModal(selectedTag)}
                        title="Редактировать тэг"
                      >
                        <Pencil className="size-4" />
                      </button>

                      <button
                        type="button"
                        className={cn(
                          iconButtonClassName,
                          'workspace-soft-button h-11 w-11 rounded-full',
                        )}
                        aria-label="Удалить тэг"
                        disabled={deleteTag.isPending}
                        onClick={deleteSelectedTag}
                        title="Удалить тэг"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
                <span className="workspace-chip rounded-full px-3 py-1.5 font-medium">
                  {visibleEvents.length} событий
                </span>

                <span className="workspace-chip rounded-full px-3 py-1.5 font-medium">
                  {selectedTag ? `Фильтр: ${selectedTag.name}` : 'Все тэги'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-b border-[color:var(--foreground)]/80 pb-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="flex flex-wrap items-center gap-8">
                {[
                  {
                    key: 'calendar' as const,
                    label: 'Календарь',
                    icon: SquareStack,
                    href: toLocalized(Routes.Profile),
                  },
                  {
                    key: 'timeline' as const,
                    label: 'Таймлайн',
                    icon: Waypoints,
                    href: toLocalized(Routes.Timeline),
                  },
                ].map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    data-active={view === item.key}
                    className="workspace-tab flex items-center gap-3 pb-1 text-[30px] font-bold leading-none tablet:text-[34px]"
                  >
                    <item.icon className="size-7" />
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-3 text-lg font-semibold text-[color:var(--foreground)]">
                <SlidersHorizontal className="size-6" />
                <span>{selectedTag ? `Фильтр: ${selectedTag.name}` : 'Фильтр'}</span>
              </div>
            </div>

            {isTagsError && (
              <div className="rounded-2xl border border-amber-300/50 bg-amber-100/70 px-4 py-3 text-sm text-amber-950 dark:bg-amber-500/10 dark:text-amber-100">
                Тэги пока не загрузились.
                {tagsError instanceof Error ? ` Причина: ${tagsError.message}` : ''}
              </div>
            )}

            {isTagsLoading && (
              <div className="text-sm text-[color:var(--muted-foreground)]">Загружаем тэги...</div>
            )}

            {isError && (
              <div className="rounded-2xl border border-amber-300/50 bg-amber-100/70 px-4 py-3 text-sm text-amber-950 dark:bg-amber-500/10 dark:text-amber-100">
                События пока не загрузились, показываем пустое представление.
                {error instanceof Error ? ` Причина: ${error.message}` : ''}
              </div>
            )}

            {isLoading ? (
              <div className="workspace-panel-solid flex h-[420px] items-center justify-center rounded-[28px] text-lg font-medium text-[color:var(--muted-foreground)]">
                Загружаем события...
              </div>
            ) : (
              <div className="space-y-4">
                {!visibleEvents.length && (
                  <div className="workspace-panel-solid rounded-[28px] border border-dashed px-6 py-8 text-sm leading-7 text-[color:var(--muted-foreground)]">
                    Пока пусто. Создай первое дело, добавь тэги и переключайся между календарем и
                    таймлайном.
                  </div>
                )}

                {view === 'timeline' ? (
                  <ProfileTimeline
                    events={visibleEvents}
                    tags={tags}
                    onEventClick={openEditEventModal}
                  />
                ) : (
                  <ProfileCalendar
                    events={visibleEvents}
                    tags={tags}
                    onEventClick={openEditEventModal}
                    onEventDateChange={handleEventDateChange}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isTagModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4">
          <form
            className="workspace-modal w-full max-w-[440px] rounded-[28px] p-6 text-[color:var(--foreground)]"
            onSubmit={submitTag}
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <h3 className="font-raleway text-[30px] font-bold leading-none">
                {editingTag ? 'Редактировать тэг' : 'Новый тэг'}
              </h3>
              <button
                type="button"
                className={iconButtonClassName}
                onClick={() => setIsTagModalOpen(false)}
              >
                <X className="size-4" />
              </button>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-[color:var(--muted-foreground)]">
              Название
              <input
                value={tagName}
                onChange={(event) => setTagName(event.target.value)}
                className={modalFieldClassName}
              />
            </label>

            <div className="mt-5 flex flex-col gap-3 text-sm font-medium text-[color:var(--muted-foreground)]">
              Цвет
              <ColorPicker value={tagColor} onChange={setTagColor} />
            </div>

            <button
              className="mt-8 h-12 w-full rounded-2xl bg-accent font-semibold text-primary transition hover:bg-button-primary-hover disabled:opacity-60"
              disabled={isTagMutationPending}
            >
              {editingTag ? 'Сохранить' : 'Создать'}
            </button>
          </form>
        </div>
      )}

      {isEventModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4">
          <form
            className="workspace-modal max-h-[92vh] w-full max-w-[660px] overflow-y-auto rounded-[28px] p-6 text-[color:var(--foreground)]"
            onSubmit={submitEvent}
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <h3 className="font-raleway text-[30px] font-bold leading-none">
                {editingEvent ? 'Редактировать событие' : 'Новое событие'}
              </h3>
              <button
                type="button"
                className={iconButtonClassName}
                onClick={() => setIsEventModalOpen(false)}
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid gap-5">
              <label className="flex flex-col gap-2 text-sm font-medium text-[color:var(--muted-foreground)]">
                Название
                <input
                  value={eventTitle}
                  onChange={(event) => setEventTitle(event.target.value)}
                  className={modalFieldClassName}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-[color:var(--muted-foreground)]">
                Описание
                <textarea
                  value={eventDescription}
                  onChange={(event) => setEventDescription(event.target.value)}
                  className={cn(modalFieldClassName, 'min-h-28 resize-y')}
                />
              </label>

              <div className="grid gap-4 tablet:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-[color:var(--muted-foreground)]">
                  Начало
                  <input
                    type="datetime-local"
                    value={eventStartsAt}
                    onChange={(event) => setEventStartsAt(event.target.value)}
                    className={modalFieldClassName}
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-[color:var(--muted-foreground)]">
                  Окончание
                  <input
                    type="datetime-local"
                    value={eventEndsAt}
                    onChange={(event) => setEventEndsAt(event.target.value)}
                    className={modalFieldClassName}
                  />
                </label>
              </div>

              <label className="flex flex-col gap-3 text-sm font-medium text-[color:var(--muted-foreground)]">
                Фокус: {eventFocus.toFixed(1)}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={eventFocus}
                  onChange={(event) => setEventFocus(Number(event.target.value))}
                  style={{ accentColor: 'var(--accent)' }}
                />
              </label>

              <div className="flex flex-col gap-3 text-sm font-medium text-[color:var(--muted-foreground)]">
                Тэги
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const selected = eventTagIds.includes(tag.id)

                    return (
                      <button
                        key={tag.id}
                        type="button"
                        className={cn(
                          'inline-flex h-10 items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] pl-2 pr-4 text-sm font-medium text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-muted)]',
                          selected && 'ring-2 ring-accent',
                        )}
                        onClick={() => toggleEventTag(tag.id)}
                      >
                        <span
                          className="size-5 shrink-0 rounded-full border border-black/5"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 tablet:flex-row">
              {editingEvent && (
                <button
                  type="button"
                  className="rounded-2xl border border-red-300/70 bg-red-500/10 px-5 py-3 font-semibold text-red-700 transition hover:bg-red-500/15 disabled:opacity-60 dark:text-red-100"
                  disabled={isEventMutationPending}
                  onClick={deleteEditingEvent}
                >
                  Удалить
                </button>
              )}

              <button
                className="flex-1 rounded-2xl bg-accent px-5 py-3 font-semibold text-primary transition hover:bg-button-primary-hover disabled:opacity-60"
                disabled={isEventMutationPending}
              >
                {editingEvent ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
