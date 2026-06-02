import { cn } from '@utils'
import { ComponentPropsWithoutRef, ReactNode } from 'react'

export interface Props extends ComponentPropsWithoutRef<'p'> {
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'p1' | 'p2' | 'button'
  className?: string
  children?: ReactNode
}

const variantMap = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  p1: 'p',
  p2: 'p',
  button: 'p',
} as const

export const variantClasses = {
  h1: 'text-[1.625rem] tablet:text-[2.5rem] font-medium leading-none',
  h2: 'text-[1.25rem] tablet:text-[2rem] font-medium leading-[1.3] tablet:leading-[1.2]',
  h3: 'text-[1rem] tablet:text-[1.25rem] font-medium leading-[1.2] tablet:leading-[1.2]',
  h4: 'text-[0.875rem] tablet:text-[1rem] font-semibold leading-[1.2]',
  p1: 'text-[0.875rem] tablet:text-[1rem] font-medium leading-[1.2]',
  p2: 'text-[0.75rem] tablet:text-[0.875rem] font-medium leading-[1.2]',
  button: 'text-[0.875rem] tablet:text-[1rem] font-normal leading-[1.1875] uppercase tracking-[3%]',
}

export const Typography = ({ variant, children, className, ...props }: Props) => {
  const Component = variantMap[variant]

  return (
    <Component
      className={cn('lining-nums proportional-nums', variantClasses[variant], className)}
      {...props}
    >
      {children}
    </Component>
  )
}
