'use client'

import { getAuthErrorMessage } from './auth-errors'

import type { Dictionary } from '@/shared/config/dictionaries'

type AuthFieldController = {
  name: string
  state: {
    value: string
    meta: {
      isTouched: boolean
      errors: unknown[]
    }
  }
  handleBlur: () => void
  handleChange: (value: string) => void
}

type Props = {
  field: AuthFieldController
  label: string
  errors: Dictionary['auth']['errors']
  type?: string
}

export const AuthField = ({ field, label, errors, type = 'text' }: Props) => {
  const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0
  const errorText = field.state.meta.errors
    .map((error) => getAuthErrorMessage(error, errors))
    .filter(Boolean)
    .join(', ')

  return (
    <label className="flex flex-col gap-3 text-white tablet:gap-3">
      <span className="font-open-sans text-[32px] font-semibold leading-none">{label}</span>
      <input
        name={field.name}
        value={field.state.value ?? ''}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        type={type}
        autoComplete="off"
        className="auth-input h-[54px] rounded-[18px] border-2 border-white bg-transparent px-5 text-[24px] font-semibold text-white caret-white outline-none transition focus:bg-white/10 tablet:h-[58px]"
        aria-invalid={hasError}
        aria-describedby={hasError ? `${field.name}-error` : undefined}
      />
      <span
        id={`${field.name}-error`}
        className="min-h-[18px] text-[14px] font-semibold leading-[18px] text-red-200"
        aria-live="polite"
      >
        {hasError ? errorText : ''}
      </span>
    </label>
  )
}
