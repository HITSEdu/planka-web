'use client'

import { Typography } from './typography'

import { cn } from '@utils'
import { ComponentPropsWithoutRef, forwardRef } from 'react'

type SwitchVariant = 'default' | 'disabled'

export interface Props extends ComponentPropsWithoutRef<'button'> {
  checked: boolean
  onCheckedChange?: (value: boolean) => void
  variant?: SwitchVariant
  label?: string
}

const baseClasses =
  'relative inline-flex items-center w-[45px] h-[23px] rounded-full withTransition'

const thumbClasses =
  'absolute left-[3px] top-[3px] w-[17px] h-[17px] rounded-full bg-switch-handle withTransition'

const variantClasses = {
  default: 'cursor-pointer',
  disabled: 'cursor-not-allowed',
}

const stateClasses = {
  checked: {
    default: 'bg-accent',
    disabled: 'bg-[#E7EBFF]',
  },
  notChecked: {
    default: 'bg-switch-default',
    disabled: 'bg-switch-disabled',
  },
}

export const Switch = forwardRef<HTMLButtonElement, Props>(
  ({ checked, onCheckedChange, variant = 'default', className, label, disabled, ...rest }, ref) => {
    const innerVariant = disabled || variant === 'disabled' ? 'disabled' : 'default'
    const isDisabled = innerVariant === 'disabled'

    const state = checked ? 'checked' : 'notChecked'

    const handleClick = () => {
      if (isDisabled) return
      onCheckedChange?.(!checked)
    }

    return (
      <div className="flex items-center gap-4 text-switch-label">
        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={isDisabled}
          onClick={handleClick}
          className={cn(
            baseClasses,
            stateClasses[state][innerVariant],
            variantClasses[innerVariant],
            className,
          )}
          {...rest}
        >
          <span className={cn(thumbClasses, checked ? 'translate-x-5.5' : 'translate-x-0')} />
        </button>

        {label && <Typography variant="p2">{label}</Typography>}
      </div>
    )
  },
)

Switch.displayName = 'Switch'
