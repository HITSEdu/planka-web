import type { EventPayloadType } from '@dto'

import { eventsApi } from '@api/events-api'
import { EVENTS_TAGS } from '@constants/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: EventPayloadType) => {
      const result = await eventsApi.create(dto)

      if (!result.ok) {
        throw new Error(result.error)
      }

      return result.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: EVENTS_TAGS.root })
    },
  })
}
