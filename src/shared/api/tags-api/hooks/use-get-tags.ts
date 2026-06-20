import { tagsApi } from '@api/tags-api'
import { TAGS_TAGS } from '@constants/api'
import { useQuery } from '@tanstack/react-query'

type Options = {
  enabled?: boolean
}

export function useGetTags({ enabled = true }: Options = {}) {
  return useQuery({
    queryKey: TAGS_TAGS.list,
    enabled,
    queryFn: async () => {
      const result = await tagsApi.list()

      if (!result.ok) {
        throw new Error(result.error)
      }

      return result.data
    },
  })
}
