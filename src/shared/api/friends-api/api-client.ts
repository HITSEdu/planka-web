import type { FriendRequestPayloadType } from '@dto'

import { withApiSafe } from '@api-client'
import { endpoints } from '@constants/api'
import {
  friendEventsSchema,
  friendInvitationSchema,
  friendSchema,
  friendsOverviewSchema,
} from '@dto'

type ListFriendEventsOptions = {
  tagName?: string
}

export const friendsApi = {
  overview: withApiSafe((api) => api.get(endpoints.friends.root, friendsOverviewSchema)),

  createRequest: withApiSafe((api, dto: FriendRequestPayloadType) =>
    api.post(endpoints.friends.requests, dto, friendInvitationSchema),
  ),

  acceptRequest: withApiSafe((api, id: string) =>
    api.post(endpoints.friends.acceptRequest(id), undefined, friendSchema),
  ),

  deleteRequest: withApiSafe((api, id: string) => api.delete(endpoints.friends.requestById(id))),

  removeFriend: withApiSafe((api, id: string) => api.delete(endpoints.friends.byId(id))),

  listEvents: withApiSafe((api, friendId: string, options: ListFriendEventsOptions = {}) =>
    api.get(endpoints.friends.events(friendId), friendEventsSchema, {
      search: options.tagName ? { tag_name: options.tagName } : undefined,
    }),
  ),
}
