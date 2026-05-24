'use client'

import { Switch, type SwitchProps } from '@ui/atoms'
import { useFieldContext } from '@utils'

type Props = Omit<SwitchProps, 'checked' | 'onCheckedChange'>

export const SwitchField = ({ label, disabled, ...rest }: Props) => {
  const field = useFieldContext<boolean>()

  return (
    <Switch
      {...rest}
      label={label}
      checked={field.state.value ?? false}
      onCheckedChange={field.handleChange}
      variant={disabled ? 'disabled' : 'default'}
      disabled={disabled}
    />
  )
}

SwitchField.displayName = 'SwitchField'
