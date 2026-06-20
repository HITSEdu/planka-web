import type { TagPayloadType } from '@dto'

import { withApi, withApiSafe } from '@api-client'
import { endpoints } from '@constants/api'
import { tagSchema, tagsSchema } from '@dto'

export const tagsApi = {
  list: withApiSafe((api) => api.get(endpoints.tags.root, tagsSchema)),

  create: withApi((api, dto: TagPayloadType) => api.post(endpoints.tags.root, dto, tagSchema)),

  update: withApi((api, id: string, dto: Partial<TagPayloadType>) =>
    api.patch(endpoints.tags.byId(id), dto, tagSchema),
  ),

  delete: withApi((api, id: string) => api.delete(endpoints.tags.byId(id))),
}
