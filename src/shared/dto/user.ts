import { GenderEnum } from '@/shared/dto/enums'
import z from 'zod'

export const userShortSchema = z.object({
  id: z.string().min(1),
  email: z.email().nullish(),
  lastName: z.string().nullish(),
  firstName: z.string().nullish(),
  patronymic: z.string().nullish(),
  birthDate: z.string(),
  gender: GenderEnum,
})

export type UserShortType = z.infer<typeof userShortSchema>
