import { friendsApi } from '@api/friends-api'
import { FRIENDS_TAGS } from '@constants/api'
import { useQuery } from '@tanstack/react-query'

export function useGetFriendsOverview() {
  return useQuery({
    queryKey: FRIENDS_TAGS.overview,
    queryFn: async () => {
      const result = await friendsApi.overview()

      if (!result.ok) {
        throw new Error(result.error)
      }

      return result.data
    },
  })
}
