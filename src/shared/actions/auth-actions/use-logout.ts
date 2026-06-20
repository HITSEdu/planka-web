'use client'

import { logoutAction } from './actions'

import { Routes } from '@constants/routes'
import { useLocalizedPath } from '@hooks/use-localized-path'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { accessStorage } from '@utils'
import { useRouter } from 'next/navigation'

export const useLogout = () => {
  const router = useRouter()
  const toLocalized = useLocalizedPath()
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: logoutAction,
    onSettled: () => {
      void queryClient.invalidateQueries({})
      accessStorage.remove()

      router.replace(toLocalized(Routes.Login))
    },
  })

  return { mutate }
}
