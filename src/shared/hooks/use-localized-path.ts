import { useLocale } from '@contexts/dictionary-context'

export const useLocalizedPath = () => {
  const locale = useLocale()

  return (path: string) => {
    const cleanPath = path.replace(/^\/+/, '')
    return `/${locale}${cleanPath ? `/${cleanPath}` : ''}`
  }
}
