import { Dictionary } from '@constants/i18n'
import { createContext, useContext } from 'react'

export type ContextType = {
  dictionary: Dictionary
  locale: 'ru' | 'en'
}

export const DictionaryContext = createContext<ContextType | null>(null)

export const useDictionary = () => {
  const ctx = useContext(DictionaryContext)
  if (!ctx) throw new Error('no dictionary context')

  return ctx.dictionary
}

export const useLocale = () => {
  const ctx = useContext(DictionaryContext)
  if (!ctx) throw new Error('no dictionary context')

  return ctx.locale
}
