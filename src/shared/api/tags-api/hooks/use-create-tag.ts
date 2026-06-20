import type { TagPayloadType } from '@dto'

import { tagsApi } from '@api/tags-api'
import { EVENTS_TAGS, TAGS_TAGS } from '@constants/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: TagPayloadType) => tagsApi.create(dto),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TAGS_TAGS.list })
      await queryClient.invalidateQueries({ queryKey: EVENTS_TAGS.root })
    },
  })
}
