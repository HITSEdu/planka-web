'use client'

import ProfileCalendar, { CalendarTag } from '../../../_ui/calendar'

import { useGetEvents } from '@api/events-api/hooks'
import { cn } from '@utils'
import { Plus, Share2, SlidersHorizontal, SquareStack, Waypoints, X } from 'lucide-react'
import { FormEvent, useEffect, useMemo, useState } from 'react'

const LOCAL_TAGS_KEY = 'planka:schedule-tags'

const defaultTags: CalendarTag[] = [
  {
    id: 'study',
    name: 'Учеба',
    color: '#91FFB5',
  },
  {
    id: 'sport',
    name: 'Спорт',
    color: '#8A91FF',
  },
  {
    id: 'home',
    name: 'Дом',
    color: '#FF8E98',
  },
]

const colorOptions = ['#91FFB5', '#8A91FF', '#FF8E98', '#919CFF', '#FFD166', '#A7F3FF']

export const ScheduleDashboard = () => {
  const [tags, setTags] = useState<CalendarTag[]>(() => {
    if (typeof window === 'undefined') {
      return defaultTags
    }

    const rawTags = window.localStorage.getItem(LOCAL_TAGS_KEY)

    if (!rawTags) {
      return defaultTags
    }

    try {
      const parsed = JSON.parse(rawTags) as CalendarTag[]

      return Array.isArray(parsed) ? parsed : defaultTags
    } catch {
      window.localStorage.removeItem(LOCAL_TAGS_KEY)

      return defaultTags
    }
  })
  const [selectedTagName, setSelectedTagName] = useState<string | undefined>()
  const [isTagModalOpen, setIsTagModalOpen] = useState(false)
  const [tagName, setTagName] = useState('')
  const [tagColor, setTagColor] = useState(colorOptions[0])

  const {
    data: events = [],
    isLoading,
    isError,
    error,
  } = useGetEvents({ tagName: selectedTagName })
  const calendarEvents = isError ? [] : events

  useEffect(() => {
    window.localStorage.setItem(LOCAL_TAGS_KEY, JSON.stringify(tags))
  }, [tags])

  const selectedTag = useMemo(
    () => tags.find((tag) => tag.name === selectedTagName),
    [selectedTagName, tags],
  )

  const submitTag = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const name = tagName.trim()

    if (!name) {
      return
    }

    const nextTag: CalendarTag = {
      id: crypto.randomUUID(),
      name,
      color: tagColor,
    }

    setTags((currentTags) => [...currentTags, nextTag])
    setTagName('')
    setTagColor(colorOptions[0])
    setIsTagModalOpen(false)
  }

  return (
    <section className="-mx-4 -my-4.75 min-h-screen bg-[radial-gradient(100%_197.75%_at_100%_50%,#00114D_0%,#060606_49.33%,#0D0D0D_100%)] px-5 py-8 text-white tablet-600:-mx-8 tablet:-mx-12.5 tablet:px-10 desktop:my-[-45px] desktop:ml-0 desktop:mr-[-152px] desktop:px-12 desktop:py-14 desktop-1920:mr-[-200px]">
      <div className="mx-auto flex min-h-full w-full max-w-[1840px] flex-col">
        <header className="flex flex-col gap-6 tablet:flex-row tablet:items-start tablet:justify-between">
          <h1 className="font-raleway text-[52px] font-bold leading-none text-white tablet:text-[72px] desktop:text-[92px]">
            Мое расписание
          </h1>

          <button className="flex h-[54px] w-fit items-center gap-3 rounded-[10px] border-2 border-white px-6 font-open-sans text-[28px] font-bold leading-none text-white transition hover:bg-white/10 tablet:h-[74px] tablet:px-10 tablet:text-[42px]">
            <Share2 className="size-7 tablet:size-9" />
            Поделиться
          </button>
        </header>

        <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-4">
          <h2 className="font-raleway text-[38px] font-bold leading-none text-white tablet:text-[52px]">
            Тэги
          </h2>

          <div className="flex flex-wrap items-center gap-5">
            <button
              className={cn(
                'flex h-8 items-center rounded-[16px_16px_0_16px] border border-white bg-[#262626] px-3 font-open-sans text-xl leading-none text-white',
                !selectedTagName && 'ring-2 ring-white',
              )}
              onClick={() => setSelectedTagName(undefined)}
            >
              Все
            </button>

            {tags.map((tag) => (
              <button
                key={tag.id}
                className={cn(
                  'flex h-8 items-center gap-2 rounded-[16px_16px_0_16px] border border-white bg-[#262626] pl-1 pr-3 font-open-sans text-xl leading-none text-white',
                  selectedTag?.id === tag.id && 'ring-2 ring-white',
                )}
                onClick={() => setSelectedTagName(tag.name)}
              >
                <span
                  className="size-6 shrink-0 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </button>
            ))}

            <button
              className="flex size-10 items-center justify-center rounded-full border border-white/80 text-white transition hover:bg-white/10"
              aria-label="Создать тэг"
              onClick={() => setIsTagModalOpen(true)}
            >
              <Plus className="size-5" />
            </button>
          </div>
        </div>

        <div className="mt-10 flex items-end justify-between border-b-[5px] border-white pb-3">
          <div className="flex items-center gap-10">
            <button className="flex items-center gap-2 font-raleway text-[28px] font-bold leading-none text-white tablet:text-[34px]">
              <SquareStack className="size-9" />
              Календарь
            </button>

            <button className="flex items-center gap-2 font-raleway text-[28px] font-bold leading-none text-white/90 tablet:text-[34px]">
              <Waypoints className="size-9" />
              Таймлайн
            </button>
          </div>

          <button className="flex items-center gap-3 font-raleway text-[28px] font-bold leading-none text-white tablet:text-[34px]">
            <SlidersHorizontal className="size-9" />
            Фильтр
          </button>
        </div>

        <div className="mt-12 min-h-[860px] flex-1">
          {isError && (
            <div className="mb-4 rounded-[12px] border border-white/50 bg-white/10 px-4 py-3 font-open-sans text-base text-white">
              События пока не загрузились, показываем пустой календарь.
              {error instanceof Error ? ` Причина: ${error.message}` : ''}
            </div>
          )}

          {isLoading ? (
            <div className="flex h-[420px] items-center justify-center font-open-sans text-2xl text-white">
              Загружаем события...
            </div>
          ) : (
            <ProfileCalendar events={calendarEvents} tags={tags} />
          )}
        </div>
      </div>

      {isTagModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4">
          <form
            className="w-full max-w-[420px] rounded-[18px] border-2 border-white bg-[#111525] p-6 text-white shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
            onSubmit={submitTag}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-raleway text-[32px] font-bold leading-none">Новый тэг</h3>
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-full border border-white/70 transition hover:bg-white/10"
                onClick={() => setIsTagModalOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>

            <label className="flex flex-col gap-2 font-open-sans text-lg">
              Название
              <input
                value={tagName}
                onChange={(event) => setTagName(event.target.value)}
                className="h-12 rounded-[12px] border border-white bg-transparent px-4 text-white outline-none focus:bg-white/10"
              />
            </label>

            <div className="mt-5 flex flex-col gap-3 font-open-sans text-lg">
              Цвет
              <div className="flex flex-wrap gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      'size-9 rounded-full border border-white/80',
                      tagColor === color && 'ring-2 ring-white ring-offset-2 ring-offset-[#111525]',
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setTagColor(color)}
                  />
                ))}
              </div>
            </div>

            <button className="mt-8 h-12 w-full rounded-[12px] border-2 border-white font-open-sans text-xl font-bold transition hover:bg-white/10">
              Создать
            </button>
          </form>
        </div>
      )}
    </section>
  )
}
