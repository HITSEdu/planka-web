import { cn } from '@utils'
import { ReactNode } from 'react'

type Props = {
  children: ReactNode
  padding?: string
}

export const CardWrapper = ({ children, padding = 'p-4 tablet-600:p-8' }: Props) => (
  <div className={cn('flex flex-col bg-active-background rounded-lg flex-1 w-full', padding)}>
    {children}
  </div>
)
