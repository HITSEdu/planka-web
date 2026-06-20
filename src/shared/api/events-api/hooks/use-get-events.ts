import { eventsApi } from '@api/events-api'
import { friendsApi } from '@api/friends-api'
import { EVENTS_TAGS, FRIENDS_TAGS } from '@constants/api'
import { useQuery } from '@tanstack/react-query'

type Options = {
  tagName?: string
  friendId?: string
}

export function useGetEvents({ tagName, friendId }: Options = {}) {
  return useQuery({
    queryKey: friendId ? FRIENDS_TAGS.events(friendId) : EVENTS_TAGS.list(tagName),
    enabled: friendId === undefined || friendId.length > 0,
    queryFn: async () => {
      const result = friendId
        ? await friendsApi.listEvents(friendId)
        : await eventsApi.list({ tagName })

      if (!result.ok) {
        throw new Error(result.error)
      }

      return result.data
    },
  })
}
