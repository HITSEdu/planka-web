'use client'
import { Typography, variantClasses } from './typography'

import { cn } from '@utils'
import {
  ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

type InputState = 'default' | 'active' | 'disabled' | 'error'

export interface Props extends ComponentPropsWithoutRef<'input'> {
  state?: InputState
  label?: string
  supporting?: string
  iconRight?: ReactNode
  iconLeft?: ReactNode
  inputBackground?: string
}

const stateClasses = {
  default: {
    wrapper: 'text-text ring ring-text/50 hover:ring-text',
    input: 'text-text',
    label: 'text-[#9D9D9D] hover:text-on-surface',
    supporting: 'text-text hover:text-on-surface',
  },

  active: {
    wrapper: 'text-text ring-text',
    input: '',
    label: 'text-on-surface',
    supporting: 'text-on-surface',
  },

  disabled: {
    wrapper: 'ring-text/40 text-text/40',
    input: 'cursor-not-allowed',
    label: 'text-on-surface/40',
    supporting: 'text-on-surface/40',
  },

  error: {
    wrapper: 'text-error ring-error',
    input: '',
    label: '',
    supporting: 'text-error',
  },
}

export const Input = forwardRef<HTMLInputElement, Props>(
  (
    {
      state = 'default',
      className,
      disabled,
      label,
      supporting,
      id,
      iconLeft,
      iconRight,
      inputBackground = 'bg-primary',
      ...rest
    },
    ref,
  ) => {
    const generatedId = useId()
    const inputId = id || generatedId

    const isDisabled = state === 'disabled' || disabled

    const [isFocused, setIsFocused] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const innerState = isDisabled ? 'disabled' : isFocused && state !== 'error' ? 'active' : state

    const labelLeftOffset = iconLeft ? 'left-11' : 'left-4'
    const inputPadding = iconLeft ? (iconRight ? 'px-12' : 'pl-12 pr-4') : 'px-4'

    useEffect(() => {
      const input = inputRef.current

      if (!input) return

      function handleFocus() {
        setIsFocused(true)
      }

      function handleBlur() {
        if (input?.value === '') {
          setIsFocused(false)
        }
      }

      input.addEventListener('focus', handleFocus)
      input.addEventListener('blur', handleBlur)

      return () => {
        input.removeEventListener('focus', handleFocus)
        input.removeEventListener('blur', handleBlur)
      }
    }, [])

    return (
      <div className="w-full flex flex-col">
        <div
          className={cn(
            'ring relative rounded-lg withTransition h-14',
            stateClasses[innerState].wrapper,
            inputPadding,
          )}
        >
          <input
            id={inputId}
            ref={(node) => {
              inputRef.current = node

              if (typeof ref === 'function') {
                ref(node)
              } else if (ref) {
                ref.current = node
              }
            }}
            disabled={isDisabled}
            className={cn(
              'w-full h-full bg-transparent outline-none',
              variantClasses.p1,
              stateClasses[innerState].input,
              className,
            )}
            {...rest}
          />

          {iconLeft && (
            <div
              className={cn(
                'absolute left-4 h-6 w-6 top-1/2 -translate-y-1/2 withTransition flexCenter',
                stateClasses[innerState].label,
                inputBackground,
              )}
            >
              {iconLeft}
            </div>
          )}

          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                `${variantClasses.p1} absolute px-1 top-1/2 -translate-y-1/2 pointer-events-none withTransition`,
                labelLeftOffset,
                isFocused && `top-0 left-4 ${variantClasses.p2}`,
                stateClasses[innerState].label,
                inputBackground,
              )}
            >
              {label}
            </label>
          )}

          {iconRight && (
            <div
              className={cn(
                'absolute right-4 h-6 w-6 top-1/2 -translate-y-1/2 withTransition flexCenter',
                stateClasses[innerState].label,
                inputBackground,
              )}
            >
              {iconRight}
            </div>
          )}
        </div>

        {supporting && (
          <Typography
            variant="p2"
            className={cn('px-4 pt-1 withTransition', stateClasses[innerState].supporting)}
          >
            {supporting}
          </Typography>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
