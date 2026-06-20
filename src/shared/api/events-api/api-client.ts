import type { EventPayloadType } from '@dto'

import { withApiSafe } from '@api-client'
import { endpoints } from '@constants/api'
import { eventSchema, eventsSchema } from '@dto'

type ListEventsOptions = {
  tagName?: string
}

export const eventsApi = {
  list: withApiSafe((api, options: ListEventsOptions = {}) =>
    api.get(endpoints.events.root, eventsSchema, {
      search: options.tagName ? { tag_name: options.tagName } : undefined,
    }),
  ),

  create: withApiSafe((api, dto: EventPayloadType) =>
    api.post(endpoints.events.root, dto, eventSchema),
  ),

  update: withApiSafe((api, id: string, dto: EventPayloadType) =>
    api.patch(endpoints.events.byId(id), dto, eventSchema),
  ),

  delete: withApiSafe((api, id: string) => api.delete(endpoints.events.byId(id))),
}
