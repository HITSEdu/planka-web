import { eventsSchema } from './events'

import z from 'zod'

export const friendUserSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string().nullable(),
  avatar_url: z.string().nullable(),
})

export const friendSchema = friendUserSchema.extend({
  shared_events_count: z.number().int(),
})

export const friendInvitationSchema = z.object({
  id: z.string(),
  user: friendUserSchema,
  created_at: z.string(),
})

export const friendsOverviewSchema = z.object({
  friends: z.array(friendSchema),
  incoming_requests: z.array(friendInvitationSchema),
  outgoing_requests: z.array(friendInvitationSchema),
})

export const friendRequestPayloadSchema = z.object({
  email: z.email(),
})

export const friendEventsSchema = eventsSchema

export type FriendUserType = z.infer<typeof friendUserSchema>
export type FriendType = z.infer<typeof friendSchema>
export type FriendInvitationType = z.infer<typeof friendInvitationSchema>
export type FriendsOverviewType = z.infer<typeof friendsOverviewSchema>
export type FriendRequestPayloadType = z.infer<typeof friendRequestPayloadSchema>
