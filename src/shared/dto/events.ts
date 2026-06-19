import z from 'zod'

export const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  starts_at: z.string().nullable(),
  ends_at: z.string().nullable(),
  focus: z.number(),
  access_status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const eventsSchema = z.array(eventSchema)

export type EventType = z.infer<typeof eventSchema>
