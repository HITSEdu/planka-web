import type { FriendRequestPayloadType } from '@dto'

import { friendsApi } from '@api/friends-api'
import { FRIENDS_TAGS } from '@constants/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useCreateFriendRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: FriendRequestPayloadType) => {
      const result = await friendsApi.createRequest(dto)

      if (!result.ok) {
        throw new Error(result.error)
      }

      return result.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: FRIENDS_TAGS.root })
    },
  })
}
