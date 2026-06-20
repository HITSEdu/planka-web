import type { EventPayloadType } from '@dto'

import { eventsApi } from '@api/events-api'
import { EVENTS_TAGS, FRIENDS_TAGS } from '@constants/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type UpdateEventInput = {
  id: string
  dto: EventPayloadType
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, dto }: UpdateEventInput) => {
      const result = await eventsApi.update(id, dto)

      if (!result.ok) {
        throw new Error(result.error)
      }

      return result.data
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: EVENTS_TAGS.root }),
        queryClient.invalidateQueries({ queryKey: FRIENDS_TAGS.root }),
      ])
    },
  })
}
