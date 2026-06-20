import { tagsApi } from '@api/tags-api'
import { EVENTS_TAGS, TAGS_TAGS } from '@constants/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tagsApi.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TAGS_TAGS.list })
      await queryClient.invalidateQueries({ queryKey: EVENTS_TAGS.root })
    },
  })
}
