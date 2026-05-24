'use client'

import { Input, InputProps } from '@ui/atoms'
import { useFieldContext } from '@utils'

export const TextField = ({
  label,
  placeholder,
  type = 'text',
  supporting,
  iconRight,
  iconLeft,
  disabled,
}: InputProps) => {
  const field = useFieldContext<string>()

  const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0

  const errorMessage = hasError
    ? field.state.meta.errors.map((e) => e.message).join(', ')
    : supporting

  return (
    <Input
      name={field.name}
      value={field.state.value ?? ''}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
      label={label}
      placeholder={placeholder}
      type={type}
      supporting={errorMessage}
      state={hasError ? 'error' : disabled ? 'disabled' : 'default'}
      iconRight={iconRight}
      iconLeft={iconLeft}
      disabled={disabled}
    />
  )
}

TextField.displayName = 'TextField'
