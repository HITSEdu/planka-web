import type { TagPayloadType } from '@dto'

import { tagsApi } from '@api/tags-api'
import { EVENTS_TAGS, TAGS_TAGS } from '@constants/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type UpdateTagInput = {
  id: string
  dto: Partial<TagPayloadType>
}

export function useUpdateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: UpdateTagInput) => tagsApi.update(id, dto),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TAGS_TAGS.list })
      await queryClient.invalidateQueries({ queryKey: EVENTS_TAGS.root })
    },
  })
}
