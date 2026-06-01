'use client'

import { cn } from '@/shared/utils'
import { CaretDown } from '@ui/atoms/icons'
import { Typography, variantClasses as typographyVariantClasses } from '@ui/atoms/typography'
import { ComponentPropsWithoutRef, ReactNode, forwardRef, useEffect, useRef, useState } from 'react'

type DropdownVariant = 'primary' | 'outlined' | 'text'
type DropdownState = 'default' | 'active' | 'disabled'

type DropdownItem = {
  label: string
  icon?: ReactNode
  onClick?: () => void
  disabled?: boolean
  needHideLabel?: boolean
}

export interface Props extends ComponentPropsWithoutRef<'button'> {
  label: string
  icon?: ReactNode
  items: DropdownItem[]
  variant?: DropdownVariant
  state?: DropdownState
  reversed?: boolean
  needHideLabel?: boolean
}

const variantClasses = {
  primary: 'text-dropdown-label bg-accent',
  outlined: 'text-accent bg-transparent ring ring-accent',
  text: 'text-text bg-transparent',
}

const stateClasses = {
  default: {
    primary: 'hover:dropdown-hover',
    outlined: 'hover:ring-2',
    text: '',
  },
  active: {
    primary: 'bg-button-active',
    outlined: 'ring-2 ring-button-active text-button-active',
    text: '',
  },
  disabled: {
    primary: 'bg-button-disabled cursor-not-allowed',
    outlined: 'text-button-disabled ring-button-disabled cursor-not-allowed',
    text: 'cursor-not-allowed opacity-80',
  },
}

export const Dropdown = forwardRef<HTMLButtonElement, Props>(
  (
    {
      variant = 'primary',
      state = 'default',
      items,
      icon,
      label,
      className,
      disabled,
      reversed,
      needHideLabel,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = state === 'disabled' || disabled

    const [open, setOpen] = useState(false)

    const innerState = isDisabled ? 'disabled' : open ? 'active' : state

    const rootRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (!!event.target && !rootRef.current?.contains(event.target as Node)) {
          setOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [])

    return (
      <div className={'relative inline-block'} ref={rootRef}>
        <button
          ref={ref}
          disabled={isDisabled}
          className={cn(
            'w-full py-2.5 px-2 gap-2 flex items-center justify-center rounded-lg cursor-pointer withTransition',
            variantClasses[variant],
            stateClasses[innerState][variant],
            className,
          )}
          onClick={() => setOpen((prev) => !prev)}
          type={'button'}
          {...rest}
        >
          {reversed ? (
            <>
              <Typography variant="p1" className={cn(needHideLabel && 'hidden laptop:block')}>
                {label}
              </Typography>
              {icon}
            </>
          ) : (
            <>
              {icon}
              <Typography variant="p1" className={cn(needHideLabel && 'hidden laptop:block')}>
                {label}
              </Typography>
            </>
          )}

          <CaretDown className={cn('withTransition', open && 'rotate-180')} />
        </button>

        {open && (
          <div className="text-text divide-y divide-divider flex flex-col py-0.5 px-2 absolute right-0 z-50 mt-2 overflow-hidden rounded-lg bg-dropdown-label">
            {items.map((item) => (
              <button
                key={item.label}
                className={cn(
                  'flex w-full items-center justify-between gap-2 py-2.5 text-left withTransition',
                  item.disabled && 'pointer-events-none opacity-50',
                )}
                disabled={item.disabled}
                onClick={() => {
                  item.onClick?.()
                  setOpen(false)
                }}
                type={'button'}
              >
                <span
                  className={cn(
                    typographyVariantClasses['p1'],
                    item.needHideLabel && 'hidden laptop:block',
                  )}
                >
                  {item.label}
                </span>
                {item.icon}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  },
)

Dropdown.displayName = 'Dropdown'
