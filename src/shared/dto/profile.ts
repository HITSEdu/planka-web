import z from 'zod'

export const profileSchema = z.object({
  id: z.uuid(),
  email: z.email().nullish(),
  lastName: z.string().nullish(),
  firstName: z.string().nullish(),
  patronymic: z.string().nullish(),
  birthDate: z.string(),
})

export type ProfileType = z.infer<typeof profileSchema>
