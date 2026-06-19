import { eventsApi } from '@api/events-api'
import { EVENTS_TAGS } from '@constants/api'
import { useQuery } from '@tanstack/react-query'

type Options = {
  tagName?: string
}

export function useGetEvents({ tagName }: Options = {}) {
  return useQuery({
    queryKey: EVENTS_TAGS.list(tagName),
    queryFn: async () => {
      const result = await eventsApi.list({ tagName })

      if (!result.ok) {
        throw new Error(result.error)
      }

      return result.data
    },
  })
}
