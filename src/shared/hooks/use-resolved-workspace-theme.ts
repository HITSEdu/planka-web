'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

export const useResolvedWorkspaceTheme = () => {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  )

  const currentTheme = mounted && resolvedTheme === 'light' ? 'light' : 'dark'
  const workspaceThemeClass = currentTheme === 'dark' ? 'workspace-dark' : 'workspace-light'

  return {
    currentTheme,
    mounted,
    setTheme,
    workspaceThemeClass,
  }
}
