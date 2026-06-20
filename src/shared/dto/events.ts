import { tagsSchema } from './tags'

import z from 'zod'

export const eventAccessStatusSchema = z.enum(['PRIVATE', 'PUBLIC', 'SHARED'])

export const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  starts_at: z.string().nullable(),
  ends_at: z.string().nullable(),
  focus: z.number(),
  access_status: eventAccessStatusSchema,
  shared_user_ids: z.array(z.string()).optional().default([]),
  tags: tagsSchema,
  created_at: z.string(),
  updated_at: z.string(),
})

export const eventsSchema = z.array(eventSchema)

export const eventPayloadSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable(),
  starts_at: z.string().nullable(),
  ends_at: z.string().nullable(),
  focus: z.number(),
  access_status: eventAccessStatusSchema,
  tag_ids: z.array(z.string()),
  shared_user_ids: z.array(z.string()),
})

export type EventType = z.infer<typeof eventSchema>
export type EventPayloadType = z.infer<typeof eventPayloadSchema>
export type EventAccessStatusType = z.infer<typeof eventAccessStatusSchema>
