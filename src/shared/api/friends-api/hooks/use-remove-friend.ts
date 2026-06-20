import { friendsApi } from '@api/friends-api'
import { EVENTS_TAGS, FRIENDS_TAGS } from '@constants/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useRemoveFriend() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await friendsApi.removeFriend(id)

      if (!result.ok) {
        throw new Error(result.error)
      }

      return result.data
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: FRIENDS_TAGS.root }),
        queryClient.invalidateQueries({ queryKey: EVENTS_TAGS.root }),
      ])
    },
  })
}
