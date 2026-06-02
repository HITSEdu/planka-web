import { GenderEnum } from './enums'

import z from 'zod'

export const profileSchema = z.object({
  id: z.string().min(1),
  email: z.email().nullish(),
  lastName: z.string().nullish(),
  firstName: z.string().nullish(),
  patronymic: z.string().nullish(),
  birthDate: z.string(),
  gender: GenderEnum,
})

export type ProfileType = z.infer<typeof profileSchema>

export const avatarUpdateSchema = z.object({
  fileId: z.string().min(1),
})

export type AvatarUpdateType = z.infer<typeof avatarUpdateSchema>

export const profileShortSchema = z.object({
  id: z.string().min(1),
  email: z.email().nullish(),
  lastName: z.string().nullish(),
  firstName: z.string().nullish(),
  patronymic: z.string().nullish(),
  birthDate: z.string(),
})

export type ProfileShortType = z.infer<typeof profileShortSchema>

export const profileUpdateSchema = z.object({
  id: z.string().min(1),
  email: z.email().nullish(),
  lastName: z.string().nullish(),
  firstName: z.string().nullish(),
  patronymic: z.string().nullish(),
  birthDate: z.string(),
  gender: GenderEnum,
})

export type ProfileUpdateType = z.infer<typeof profileUpdateSchema>