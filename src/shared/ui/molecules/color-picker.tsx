'use client'

import { cn } from '@utils'

type Props = {
  value: string | null
  onChange: (color: string) => void
}

export function ColorPicker({ value, onChange }: Props) {
  const hasValue = Boolean(value)
  const inputValue = value ?? '#000000'

  return (
    <label className="flex items-center gap-3">
      <span
        className={cn(
          'size-10 shrink-0 rounded-full border border-[color:var(--border)]',
          !hasValue && 'bg-[color:var(--surface-muted)]',
        )}
        style={hasValue ? { backgroundColor: value! } : undefined}
      />
      <input
        type="color"
        value={inputValue}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 min-w-0 flex-1 cursor-pointer rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-1"
      />
      <span className="min-w-[88px] text-sm font-semibold uppercase text-[color:var(--foreground)]">
        {hasValue ? value!.toUpperCase() : 'Не выбран'}
      </span>
    </label>
  )
}
