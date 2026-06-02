import { ContextType, DictionaryContext } from './context'

import { ReactNode } from 'react'

type Props = {
  value: ContextType
  children: ReactNode
}

export function DictionaryProvider({ children, value }: Props) {
  return <DictionaryContext value={value}>{children}</DictionaryContext>
}
