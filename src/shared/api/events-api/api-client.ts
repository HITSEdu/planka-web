import { withApiSafe } from '@api-client'
import { endpoints } from '@constants/api'
import { eventsSchema } from '@dto'

type ListEventsOptions = {
  tagName?: string
}

export const eventsApi = {
  list: withApiSafe((api, options: ListEventsOptions = {}) =>
    api.get(endpoints.events.root, eventsSchema, {
      search: options.tagName ? { tag_name: options.tagName } : undefined,
    }),
  ),
}
