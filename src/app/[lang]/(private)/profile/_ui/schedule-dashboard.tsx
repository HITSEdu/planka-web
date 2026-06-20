'use client'

import ProfileCalendar from '../../../_ui/calendar'
import ProfileTimeline from '../../../_ui/timeline'

import type { EventAccessStatusType, EventType, TagType } from '@dto'

import { useResolvedWorkspaceTheme } from '@/shared/hooks'
import { useLogout } from '@actions/auth-actions'
import { useCreateEvent, useDeleteEvent, useGetEvents, useUpdateEvent } from '@api/events-api/hooks'
import { useGetFriendsOverview } from '@api/friends-api/hooks'
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
  Users,
  Waypoints,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

const modalFieldClassName =
  'min-h-12 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-[color:var(--foreground)] outline-none transition focus:bg-[color:var(--surface-muted)]'

const iconButtonClassName =
  'flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-muted)] disabled:opacity-50'

const themeToggleButtonClassName =
  'flex size-12 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] transition hover:bg-[color:var(--surface-muted)]'

const accessOptions: Array<{
  value: EventAccessStatusType
  label: string
  hint: string
}> = [
  {
    value: 'PRIVATE',
    label: 'Только я',
    hint: 'Событие видно только владельцу.',
  },
  {
    value: 'SHARED',
    label: 'С друзьями',
    hint: 'Событие увидят только выбранные друзья.',
  },
  {
    value: 'PUBLIC',
    label: 'Публично',
    hint: 'Событие будет доступно всем друзьям, у кого есть ссылка на расписание.',
  },
]

type ScheduleView = 'calendar' | 'timeline'

type Props = {
  view: ScheduleView
}

type DisplayTag = Pick<TagType, 'id' | 'name' | 'color'>

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

const deriveTagsFromEvents = (events: EventType[]): DisplayTag[] => {
  const tagsMap = new Map<string, DisplayTag>()

  for (const event of events) {
    for (const tag of event.tags) {
      tagsMap.set(tag.id, {
        id: tag.id,
        name: tag.name,
        color: tag.color,
      })
    }
  }

  return Array.from(tagsMap.values()).sort((left, right) => left.name.localeCompare(right.name))
}

const friendLabel = (friend: { name: string | null; email: string }) => friend.name ?? friend.email

export const ScheduleDashboard = ({ view }: Props) => {
  const toLocalized = useLocalizedPath()
  const searchParams = useSearchParams()
  const activeFriendId = searchParams.get('friend') ?? undefined
  const isFriendView = Boolean(activeFriendId)
  const { currentTheme, mounted, setTheme, workspaceThemeClass } = useResolvedWorkspaceTheme()
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
  const [eventAccessStatus, setEventAccessStatus] = useState<EventAccessStatusType>('PRIVATE')
  const [eventSharedUserIds, setEventSharedUserIds] = useState<string[]>([])
  const didHandleUnauthorized = useRef(false)

  const { mutate: logout } = useLogout()
  const {
    data: ownTags = [],
    isLoading: isTagsLoading,
    isError: isTagsError,
    error: tagsError,
  } = useGetTags({ enabled: !isFriendView })
  const selectedTagNameForQuery =
    !isFriendView && ownTags.some((tag) => tag.name === selectedTagName)
      ? selectedTagName
      : undefined
  const {
    data: friendsOverview,
    isError: isFriendsError,
    error: friendsError,
  } = useGetFriendsOverview()
  const createTag = useCreateTag()
  const updateTag = useUpdateTag()
  const deleteTag = useDeleteTag()
  const {
    data: events = [],
    isLoading,
    isError,
    error,
  } = useGetEvents(
    isFriendView ? { friendId: activeFriendId } : { tagName: selectedTagNameForQuery },
  )
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()

  const friends = useMemo(() => friendsOverview?.friends ?? [], [friendsOverview])
  const activeFriend = useMemo(
    () => friends.find((friend) => friend.id === activeFriendId),
    [activeFriendId, friends],
  )
  const tags = useMemo<DisplayTag[]>(
    () => (isFriendView ? deriveTagsFromEvents(events) : ownTags),
    [events, isFriendView, ownTags],
  )
  const effectiveSelectedTagName =
    selectedTagName && tags.some((tag) => tag.name === selectedTagName)
      ? selectedTagName
      : undefined
  const visibleEvents = useMemo(() => {
    if (isError) {
      return []
    }

    if (!effectiveSelectedTagName) {
      return events
    }

    return events.filter((event) => event.tags.some((tag) => tag.name === effectiveSelectedTagName))
  }, [effectiveSelectedTagName, events, isError])
  const selectedTag = useMemo(
    () => tags.find((tag) => tag.name === effectiveSelectedTagName),
    [effectiveSelectedTagName, tags],
  )

  const isTagMutationPending = createTag.isPending || updateTag.isPending || deleteTag.isPending
  const isEventMutationPending =
    createEvent.isPending || updateEvent.isPending || deleteEvent.isPending
  const friendQuery = activeFriendId ? `?friend=${activeFriendId}` : ''
  const friendsPageHref = toLocalized(Routes.Friends)
  const accessHint =
    accessOptions.find((option) => option.value === eventAccessStatus)?.hint ??
    accessOptions[0].hint

  useEffect(() => {
    const tagsUnauthorized =
      isTagsError && tagsError instanceof Error && tagsError.message === Status.Unauthorized
    const eventsUnauthorized =
      isError && error instanceof Error && error.message === Status.Unauthorized
    const friendsUnauthorized =
      isFriendsError &&
      friendsError instanceof Error &&
      friendsError.message === Status.Unauthorized

    if (
      !didHandleUnauthorized.current &&
      (tagsUnauthorized || eventsUnauthorized || friendsUnauthorized)
    ) {
      didHandleUnauthorized.current = true
      logout()
    }
  }, [error, friendsError, isError, isFriendsError, isTagsError, logout, tagsError])

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
    if (isFriendView || !selectedTag) {
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
    setEventAccessStatus('PRIVATE')
    setEventSharedUserIds([])
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
    setEventAccessStatus(event.access_status)
    setEventSharedUserIds(event.shared_user_ids)
    setIsEventModalOpen(true)
  }

  const toggleEventTag = (tagID: string) => {
    setEventTagIds((currentTagIDs) =>
      currentTagIDs.includes(tagID)
        ? currentTagIDs.filter((currentTagID) => currentTagID !== tagID)
        : [...currentTagIDs, tagID],
    )
  }

  const toggleSharedFriend = (friendID: string) => {
    setEventSharedUserIds((currentFriendIDs) =>
      currentFriendIDs.includes(friendID)
        ? currentFriendIDs.filter((currentFriendID) => currentFriendID !== friendID)
        : [...currentFriendIDs, friendID],
    )
  }

  const submitEvent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const title = eventTitle.trim()

    if (!title) {
      toast.error('Введите название события')
      return
    }

    if (eventAccessStatus === 'SHARED' && !eventSharedUserIds.length) {
      toast.error('Выберите хотя бы одного друга для общего события')
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
      access_status: eventAccessStatus,
      tag_ids: eventTagIds,
      shared_user_ids: eventAccessStatus === 'SHARED' ? eventSharedUserIds : [],
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
            access_status: event.access_status,
            tag_ids: event.tags.map((tag) => tag.id),
            shared_user_ids: event.shared_user_ids,
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
                {isFriendView
                  ? `Расписание: ${activeFriend ? friendLabel(activeFriend) : 'друг'}`
                  : 'Мое расписание'}
              </h1>
              <p className="max-w-[720px] text-base leading-7 text-[color:var(--muted-foreground)] tablet:text-lg">
                {isFriendView
                  ? 'Открыто только то, чем друг поделился с тобой. Здесь ничего нельзя редактировать, зато можно переключаться между календарем и таймлайном.'
                  : 'Дела, тэги и представления собраны в один рабочий экран. Здесь же настраивается доступ к событиям для друзей.'}
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

            {isFriendView ? (
              <>
                <Link
                  href={toLocalized(Routes.Profile)}
                  className="flex items-center gap-2 rounded-[18px] bg-accent px-5 py-3 text-sm font-semibold text-primary transition hover:opacity-90"
                >
                  <SquareStack className="size-4" />
                  Мое расписание
                </Link>
                <Link
                  href={friendsPageHref}
                  className="workspace-outline-button flex items-center gap-3 rounded-[18px] px-6 py-3 text-lg font-semibold"
                >
                  <Users className="size-5" />К друзьям
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-[18px] bg-accent px-5 py-3 text-sm font-semibold text-primary transition hover:opacity-90"
                  onClick={openCreateEventModal}
                >
                  <Plus className="size-4" />
                  Создать дело
                </button>

                <Link
                  href={friendsPageHref}
                  className="workspace-outline-button flex items-center gap-3 rounded-[18px] px-6 py-3 text-lg font-semibold"
                >
                  <Share2 className="size-5" />
                  Поделиться
                </Link>
              </>
            )}
          </div>
        </header>

        <div className="workspace-panel rounded-[32px] px-5 py-6 tablet:px-7 desktop:px-10">
          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Tag className="size-7 text-[color:var(--foreground)]" />
                  <h2 className="font-raleway text-[34px] font-bold leading-none tablet:text-[42px]">
                    {isFriendView ? 'Тэги друга' : 'Тэги'}
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

                  {!isFriendView && (
                    <>
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
                            onClick={() => {
                              const editableTag = ownTags.find((tag) => tag.id === selectedTag.id)

                              if (editableTag) {
                                openEditTagModal(editableTag)
                              }
                            }}
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

                {isFriendView && activeFriend && (
                  <span className="workspace-chip rounded-full px-3 py-1.5 font-medium">
                    Друг: {friendLabel(activeFriend)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 border-b border-[color:var(--foreground)]/80 pb-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="flex flex-wrap items-center gap-8">
                {[
                  {
                    key: 'calendar' as const,
                    label: 'Календарь',
                    icon: SquareStack,
                    href: `${toLocalized(Routes.Profile)}${friendQuery}`,
                  },
                  {
                    key: 'timeline' as const,
                    label: 'Таймлайн',
                    icon: Waypoints,
                    href: `${toLocalized(Routes.Timeline)}${friendQuery}`,
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

            {!isFriendView && isTagsError && (
              <div className="rounded-2xl border border-amber-300/50 bg-amber-100/70 px-4 py-3 text-sm text-amber-950 dark:bg-amber-500/10 dark:text-amber-100">
                Тэги пока не загрузились.
                {tagsError instanceof Error ? ` Причина: ${tagsError.message}` : ''}
              </div>
            )}

            {isFriendsError && (
              <div className="rounded-2xl border border-amber-300/50 bg-amber-100/70 px-4 py-3 text-sm text-amber-950 dark:bg-amber-500/10 dark:text-amber-100">
                Список друзей пока не загрузился.
                {friendsError instanceof Error ? ` Причина: ${friendsError.message}` : ''}
              </div>
            )}

            {!isFriendView && isTagsLoading && (
              <div className="text-sm text-[color:var(--muted-foreground)]">Загружаем тэги...</div>
            )}

            {isError && (
              <div className="rounded-2xl border border-amber-300/50 bg-amber-100/70 px-4 py-3 text-sm text-amber-950 dark:bg-amber-500/10 dark:text-amber-100">
                {isFriendView
                  ? 'Расписание друга пока не загрузилось, показываем пустое представление.'
                  : 'События пока не загрузились, показываем пустое представление.'}
                {error instanceof Error ? ` Причина: ${error.message}` : ''}
              </div>
            )}

            {isFriendView && activeFriendId && !activeFriend && friendsOverview && (
              <div className="rounded-2xl border border-amber-300/50 bg-amber-100/70 px-4 py-3 text-sm text-amber-950 dark:bg-amber-500/10 dark:text-amber-100">
                Не удалось найти выбранного друга в текущем списке.
              </div>
            )}

            {isLoading ? (
              <div className="workspace-panel-solid flex h-[420px] items-center justify-center rounded-[28px] text-lg font-medium text-[color:var(--muted-foreground)]">
                {isFriendView ? 'Загружаем расписание друга...' : 'Загружаем события...'}
              </div>
            ) : (
              <div className="space-y-4">
                {!visibleEvents.length && (
                  <div className="workspace-panel-solid rounded-[28px] border border-dashed px-6 py-8 text-sm leading-7 text-[color:var(--muted-foreground)]">
                    {isFriendView
                      ? 'Пока пусто. Возможно, друг еще не поделился ни одним делом или текущий фильтр ничего не нашел.'
                      : 'Пока пусто. Создай первое дело, добавь тэги и выбери, с кем из друзей им поделиться.'}
                  </div>
                )}

                {view === 'timeline' ? (
                  <ProfileTimeline
                    themeKey={mounted ? currentTheme : 'dark'}
                    events={visibleEvents}
                    tags={tags}
                    onEventClick={isFriendView ? undefined : openEditEventModal}
                  />
                ) : (
                  <ProfileCalendar
                    themeKey={mounted ? currentTheme : 'dark'}
                    events={visibleEvents}
                    tags={tags}
                    onEventClick={isFriendView ? undefined : openEditEventModal}
                    onEventDateChange={handleEventDateChange}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {!isFriendView && isTagModalOpen && (
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

      {!isFriendView && isEventModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4">
          <form
            className="workspace-modal max-h-[92vh] w-full max-w-[720px] overflow-y-auto rounded-[28px] p-6 text-[color:var(--foreground)]"
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
                  {ownTags.map((tag) => {
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

              <div className="flex flex-col gap-3 text-sm font-medium text-[color:var(--muted-foreground)]">
                Доступ
                <div className="inline-flex w-fit flex-wrap rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-1">
                  {accessOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        'rounded-[14px] px-4 py-2 text-sm font-semibold transition',
                        eventAccessStatus === option.value
                          ? 'bg-accent text-primary'
                          : 'text-[color:var(--muted-foreground)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--foreground)]',
                      )}
                      onClick={() => setEventAccessStatus(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs leading-6 text-[color:var(--muted-foreground)]">
                  {accessHint}
                </p>
              </div>

              {eventAccessStatus === 'SHARED' && (
                <div className="flex flex-col gap-3 text-sm font-medium text-[color:var(--muted-foreground)]">
                  С кем делимся
                  {friends.length ? (
                    <div className="flex flex-wrap gap-2">
                      {friends.map((friend) => {
                        const selected = eventSharedUserIds.includes(friend.id)

                        return (
                          <button
                            key={friend.id}
                            type="button"
                            className={cn(
                              'inline-flex h-10 items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 text-sm font-medium text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-muted)]',
                              selected && 'ring-2 ring-accent',
                            )}
                            onClick={() => toggleSharedFriend(friend.id)}
                          >
                            <Users className="size-4" />
                            {friendLabel(friend)}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[color:var(--border)] px-4 py-4 text-sm leading-7 text-[color:var(--muted-foreground)]">
                      Сначала добавь друзей, чтобы делиться делами.
                      <div className="mt-2">
                        <Link
                          href={friendsPageHref}
                          className="text-accent underline underline-offset-4"
                        >
                          Перейти к друзьям
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
