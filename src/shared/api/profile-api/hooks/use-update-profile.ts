import type { ProfileUpdatePayloadType } from '@dto'

import { profileApi } from '@api/profile-api'
import { FRIENDS_TAGS, PROFILE_TAGS } from '@constants/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: ProfileUpdatePayloadType) => {
      const result = await profileApi.updateProfile(dto)

      if (!result.ok) {
        throw new Error(result.error)
      }

      return result.data
    },
    onSuccess: async (profile) => {
      queryClient.setQueryData(PROFILE_TAGS.getProfile, { ok: true, data: profile })

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: PROFILE_TAGS.getProfile }),
        queryClient.invalidateQueries({ queryKey: FRIENDS_TAGS.root }),
      ])
    },
  })
}
