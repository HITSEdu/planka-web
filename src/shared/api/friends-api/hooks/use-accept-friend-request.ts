import { friendsApi } from '@api/friends-api'
import { FRIENDS_TAGS } from '@constants/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await friendsApi.acceptRequest(id)

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
