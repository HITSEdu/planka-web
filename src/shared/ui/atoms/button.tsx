import { Typography } from './typography'

import { cn } from '@utils'
import { ComponentPropsWithoutRef, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'outlined'
type ButtonState = 'default' | 'active' | 'disabled'

export interface Props extends ComponentPropsWithoutRef<'button'> {
  variant?: ButtonVariant
  state?: ButtonState
}

const variantClasses = {
  primary: 'text-primary bg-accent',
  outlined: 'text-text bg-transparent ring ring-text',
}

const stateClasses = {
  default: {
    primary: 'hover:bg-button-primary-hover',
    outlined: 'hover:ring-2',
  },
  active: {
    primary: 'bg-button-active',
    outlined: 'ring-2 ring-button-active text-button-active',
  },
  disabled: {
    primary: 'bg-button-disabled cursor-not-allowed',
    outlined: 'text-button-disabled ring-button-disabled cursor-not-allowed',
  },
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', state = 'default', className, children, disabled, ...rest }, ref) => {
    const isDisabled = state === 'disabled' || disabled
    const innerState = isDisabled ? 'disabled' : state

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'w-full flex items-center justify-center p-3.75 rounded-lg cursor-pointer transition-all duration-300 ease-linear',
          variantClasses[variant],
          stateClasses[innerState][variant],
          className,
        )}
        {...rest}
      >
        <Typography variant="button">{children}</Typography>
      </button>
    )
  },
)

Button.displayName = 'Button'
