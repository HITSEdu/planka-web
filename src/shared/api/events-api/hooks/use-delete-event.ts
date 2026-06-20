import { eventsApi } from '@api/events-api'
import { EVENTS_TAGS } from '@constants/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await eventsApi.delete(id)

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
