'use client'

import { useLocalizedPath, useResolvedWorkspaceTheme } from '@/shared/hooks'
import { useLogout } from '@actions/auth-actions'
import {
  useAcceptFriendRequest,
  useCreateFriendRequest,
  useDeleteFriendRequest,
  useGetFriendsOverview,
  useRemoveFriend,
} from '@api/friends-api/hooks'
import { Status } from '@constants/api'
import { Routes } from '@constants/routes'
import { cn } from '@utils'
import {
  ArrowRight,
  Check,
  Clock3,
  Mail,
  Moon,
  Send,
  Share2,
  SunMedium,
  UserMinus,
  Users,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

const fieldClassName =
  'min-h-12 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-[color:var(--foreground)] outline-none transition focus:bg-[color:var(--surface-muted)]'

const cardClassName = 'workspace-panel-solid rounded-[28px] p-5'

const friendLabel = (friend: { name: string | null; email: string }) => friend.name ?? friend.email

const friendInitials = (friend: { name: string | null; email: string }) => {
  const source = friend.name ?? friend.email
  const parts = source
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length > 1) {
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')
  }

  return (source[0] ?? 'P').toUpperCase()
}

type FriendAvatarProps = {
  user: {
    name: string | null
    email: string
    avatar_url: string | null
  }
  size?: 'sm' | 'md' | 'lg'
}

const avatarSizeClassName = {
  sm: 'size-12 text-base',
  md: 'size-14 text-lg',
  lg: 'size-16 text-xl',
}

function FriendAvatar({ user, size = 'md' }: FriendAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const avatarSrc = user.avatar_url && failedSrc !== user.avatar_url ? user.avatar_url : null

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] font-bold text-accent',
        avatarSizeClassName[size],
      )}
    >
      {avatarSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarSrc}
          alt={friendLabel(user)}
          className="size-full object-cover"
          onError={() => setFailedSrc(avatarSrc)}
        />
      ) : (
        <span>{friendInitials(user)}</span>
      )}
    </div>
  )
}

export function FriendsWorkspace() {
  const toLocalized = useLocalizedPath()
  const { currentTheme, setTheme, workspaceThemeClass } = useResolvedWorkspaceTheme()
  const didHandleUnauthorized = useRef(false)
  const [email, setEmail] = useState('')

  const { mutate: logout } = useLogout()
  const { data, isLoading, isError, error } = useGetFriendsOverview()
  const createRequest = useCreateFriendRequest()
  const acceptRequest = useAcceptFriendRequest()
  const deleteRequest = useDeleteFriendRequest()
  const removeFriend = useRemoveFriend()

  useEffect(() => {
    if (!isError || !(error instanceof Error) || error.message !== Status.Unauthorized) {
      return
    }
    if (didHandleUnauthorized.current) {
      return
    }

    didHandleUnauthorized.current = true
    logout()
  }, [error, isError, logout])

  const friends = data?.friends ?? []
  const incomingRequests = data?.incoming_requests ?? []
  const outgoingRequests = data?.outgoing_requests ?? []

  const stats = useMemo(
    () => [
      {
        label: 'Друзья',
        value: friends.length,
      },
      {
        label: 'Входящие',
        value: incomingRequests.length,
      },
      {
        label: 'Исходящие',
        value: outgoingRequests.length,
      },
    ],
    [friends.length, incomingRequests.length, outgoingRequests.length],
  )

  const submitRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedEmail = email.trim()
    if (!normalizedEmail) {
      toast.error('Введите email пользователя')
      return
    }

    createRequest.mutate(
      { email: normalizedEmail },
      {
        onSuccess: () => {
          setEmail('')
          toast.success('Заявка в друзья отправлена')
        },
        onError: (requestError) => {
          toast.error(requestError.message || 'Не удалось отправить заявку')
        },
      },
    )
  }

  return (
    <section
      className={cn(
        workspaceThemeClass,
        'workspace-screen -mx-4 -my-4.75 min-h-screen px-5 py-8 text-[color:var(--foreground)] tablet-600:-mx-8 tablet:-mx-12.5 tablet:px-10 desktop:my-[-45px] desktop:ml-0 desktop:mr-[-152px] desktop:px-12 desktop:py-14 desktop-1920:mr-[-200px]',
      )}
    >
      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[1600px] flex-col gap-8">
        <header className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-5">
            <span className="block font-syncopate text-xs uppercase tracking-[0.34em] text-[color:var(--muted-foreground)]">
              Planka
            </span>

            <div className="space-y-4">
              <h1 className="font-raleway text-[44px] font-bold leading-none tablet:text-[58px] desktop:text-[68px]">
                Друзья и приглашения
              </h1>
              <p className="max-w-[760px] text-base leading-7 text-[color:var(--muted-foreground)] tablet:text-lg">
                Отправляй заявки по email, принимай входящие и открывай расписание друзей. Общие
                дела появляются в их расписании автоматически, когда событие помечено как shared.
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

            <Link
              href={toLocalized(Routes.Profile)}
              className="workspace-outline-button flex items-center gap-3 rounded-[18px] px-6 py-3 text-lg font-semibold"
            >
              <Share2 className="size-5" />К расписанию
            </Link>
          </div>
        </header>

        {isError && (
          <div className="rounded-[28px] border border-amber-300/50 bg-amber-100/70 px-6 py-5 text-sm text-amber-950 dark:bg-amber-500/10 dark:text-amber-100">
            Не удалось загрузить друзей и заявки.
            {error instanceof Error ? ` Причина: ${error.message}` : ''}
          </div>
        )}

        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <form className={cn(cardClassName, 'space-y-5')} onSubmit={submitRequest}>
            <div className="flex items-center gap-3">
              <Send className="size-6 text-accent" />
              <h2 className="font-raleway text-[28px] font-bold leading-none tablet:text-[34px]">
                Новое приглашение
              </h2>
            </div>

            <p className="text-sm leading-7 text-[color:var(--muted-foreground)]">
              Достаточно email пользователя. Как только он примет заявку, его можно будет выбрать в
              shared-событиях и открывать его расписание.
            </p>

            <label className="flex flex-col gap-2 text-sm font-medium text-[color:var(--muted-foreground)]">
              Email друга
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="friend@example.com"
                className={fieldClassName}
              />
            </label>

            <button
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent px-5 font-semibold text-primary transition hover:bg-button-primary-hover disabled:opacity-60"
              disabled={createRequest.isPending}
            >
              <Send className="size-4" />
              Отправить заявку
            </button>
          </form>

          <div
            className={cn(
              cardClassName,
              'grid gap-4 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3',
            )}
          >
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-5"
              >
                <div className="text-sm font-medium text-[color:var(--muted-foreground)]">
                  {item.label}
                </div>
                <div className="mt-3 font-raleway text-[36px] font-bold leading-none text-[color:var(--foreground)]">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.98fr_1.02fr]">
          <div className="space-y-5">
            <section className={cardClassName}>
              <div className="mb-5 flex items-center gap-3">
                <Users className="size-6 text-accent" />
                <h2 className="font-raleway text-[28px] font-bold leading-none tablet:text-[34px]">
                  Входящие заявки
                </h2>
              </div>

              {isLoading ? (
                <div className="text-sm text-[color:var(--muted-foreground)]">
                  Загружаем заявки...
                </div>
              ) : incomingRequests.length ? (
                <div className="space-y-3">
                  {incomingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <FriendAvatar size="sm" user={request.user} />
                          <div className="min-w-0">
                            <div className="truncate text-lg font-semibold text-[color:var(--foreground)]">
                              {friendLabel(request.user)}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
                              <Mail className="size-4 shrink-0" />
                              <span className="truncate">{request.user.email}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="flex h-11 items-center gap-2 rounded-2xl bg-accent px-4 text-sm font-semibold text-primary transition hover:bg-button-primary-hover disabled:opacity-60"
                            disabled={acceptRequest.isPending}
                            onClick={() =>
                              acceptRequest.mutate(request.id, {
                                onSuccess: () => toast.success('Заявка принята'),
                                onError: (requestError) =>
                                  toast.error(requestError.message || 'Не удалось принять заявку'),
                              })
                            }
                          >
                            <Check className="size-4" />
                            Принять
                          </button>

                          <button
                            type="button"
                            className="workspace-soft-button flex h-11 items-center gap-2 rounded-2xl px-4 text-sm font-semibold disabled:opacity-60"
                            disabled={deleteRequest.isPending}
                            onClick={() =>
                              deleteRequest.mutate(request.id, {
                                onSuccess: () => toast.success('Заявка отклонена'),
                                onError: (requestError) =>
                                  toast.error(
                                    requestError.message || 'Не удалось отклонить заявку',
                                  ),
                              })
                            }
                          >
                            <X className="size-4" />
                            Отклонить
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-[color:var(--border)] px-4 py-5 text-sm leading-7 text-[color:var(--muted-foreground)]">
                  Пока нет входящих заявок.
                </div>
              )}
            </section>

            <section className={cardClassName}>
              <div className="mb-5 flex items-center gap-3">
                <Clock3 className="size-6 text-accent" />
                <h2 className="font-raleway text-[28px] font-bold leading-none tablet:text-[34px]">
                  Исходящие заявки
                </h2>
              </div>

              {isLoading ? (
                <div className="text-sm text-[color:var(--muted-foreground)]">
                  Загружаем заявки...
                </div>
              ) : outgoingRequests.length ? (
                <div className="space-y-3">
                  {outgoingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex flex-col gap-4 rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <FriendAvatar size="sm" user={request.user} />
                        <div className="min-w-0">
                          <div className="truncate text-lg font-semibold text-[color:var(--foreground)]">
                            {friendLabel(request.user)}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
                            <Mail className="size-4 shrink-0" />
                            <span className="truncate">{request.user.email}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="workspace-soft-button flex h-11 items-center gap-2 rounded-2xl px-4 text-sm font-semibold disabled:opacity-60"
                        disabled={deleteRequest.isPending}
                        onClick={() =>
                          deleteRequest.mutate(request.id, {
                            onSuccess: () => toast.success('Заявка отменена'),
                            onError: (requestError) =>
                              toast.error(requestError.message || 'Не удалось отменить заявку'),
                          })
                        }
                      >
                        <X className="size-4" />
                        Отменить
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-[color:var(--border)] px-4 py-5 text-sm leading-7 text-[color:var(--muted-foreground)]">
                  Ты пока никому не отправлял заявку.
                </div>
              )}
            </section>
          </div>

          <section className={cardClassName}>
            <div className="mb-5 flex items-center gap-3">
              <Users className="size-6 text-accent" />
              <h2 className="font-raleway text-[28px] font-bold leading-none tablet:text-[34px]">
                Друзья
              </h2>
            </div>

            {isLoading ? (
              <div className="text-sm text-[color:var(--muted-foreground)]">
                Загружаем друзей...
              </div>
            ) : friends.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="rounded-[26px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <FriendAvatar size="lg" user={friend} />
                      <div className="min-w-0">
                        <div className="truncate text-xl font-semibold text-[color:var(--foreground)]">
                          {friendLabel(friend)}
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
                          <Mail className="size-4 shrink-0" />
                          <span className="truncate">{friend.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-3 text-sm text-[color:var(--muted-foreground)]">
                      Доступно shared-событий:{' '}
                      <span className="font-semibold text-[color:var(--foreground)]">
                        {friend.shared_events_count}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                      <Link
                        href={`${toLocalized(Routes.Profile)}?friend=${friend.id}`}
                        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-accent px-4 text-sm font-semibold text-primary transition hover:bg-button-primary-hover"
                      >
                        <ArrowRight className="size-4" />
                        Открыть расписание
                      </Link>

                      <button
                        type="button"
                        className="workspace-soft-button flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold disabled:opacity-60"
                        disabled={removeFriend.isPending}
                        onClick={() =>
                          removeFriend.mutate(friend.id, {
                            onSuccess: () => toast.success('Пользователь удален из друзей'),
                            onError: (requestError) =>
                              toast.error(
                                requestError.message || 'Не удалось удалить пользователя из друзей',
                              ),
                          })
                        }
                      >
                        <UserMinus className="size-4" />
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-[color:var(--border)] px-4 py-5 text-sm leading-7 text-[color:var(--muted-foreground)]">
                Пока нет друзей. Отправь первую заявку выше.
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  )
}
