import z from 'zod'

export const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const tagsSchema = z.array(tagSchema)

export const tagPayloadSchema = z.object({
  name: z.string().min(1),
  color: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/),
})

export type TagType = z.infer<typeof tagSchema>
export type TagPayloadType = z.infer<typeof tagPayloadSchema>
