'use client'

import { authApi } from '@api/auth-api'
import { Routes } from '@constants/routes'
import { useDictionary } from '@contexts/dictionary-context'
import { clearRefreshTokenFromCookies } from '@server'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { accessStorage } from '@utils'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export const useLogout = () => {
  const dict = useDictionary().nav.logout
  const router = useRouter()
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({})
      accessStorage.remove()
      await clearRefreshTokenFromCookies()

      router.replace(Routes.Login)
    },
    onError: () => {
      toast.error(dict.error)
    },
  })

  return { mutate }
}
