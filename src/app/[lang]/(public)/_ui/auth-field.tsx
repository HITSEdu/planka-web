'use client'

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
  type?: string
}

export const AuthField = ({ field, label, type = 'text' }: Props) => {
  const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0
  const errorText = field.state.meta.errors.map(getErrorMessage).filter(Boolean).join(', ')

  return (
    <label className="flex flex-col gap-5 text-white tablet:gap-3">
      <span className="font-open-sans text-[32px] font-semibold leading-none">{label}</span>
      <input
        name={field.name}
        value={field.state.value ?? ''}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        type={type}
        autoComplete="off"
        className="auth-input h-[54px] rounded-[18px] border-2 border-white bg-transparent px-5 text-[24px] font-semibold text-white caret-white outline-none transition focus:bg-white/10 tablet:h-[58px]"
      />
      {hasError && (
        <span className="-mt-1 text-[14px] font-semibold text-red-200">{errorText}</span>
      )}
    </label>
  )
}

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }

  return typeof error === 'string' ? error : ''
}
