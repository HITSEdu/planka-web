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
  avatarUrl: z.string().nullish(),
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
  avatarUrl: z.string().nullish(),
})

export type ProfileShortType = z.infer<typeof profileShortSchema>

export const profileUpdatePayloadSchema = z.object({
  lastName: z.string().nullable(),
  firstName: z.string().nullable(),
  patronymic: z.string().nullable(),
  birthDate: z.string(),
  gender: GenderEnum,
  avatarUrl: z.string().nullable(),
})

export type ProfileUpdatePayloadType = z.infer<typeof profileUpdatePayloadSchema>

export const profileUpdateSchema = z.object({
  id: z.string().min(1),
  email: z.email().nullish(),
  lastName: z.string().nullish(),
  firstName: z.string().nullish(),
  patronymic: z.string().nullish(),
  birthDate: z.string(),
  gender: GenderEnum,
  avatarUrl: z.string().nullish(),
})

export type ProfileUpdateType = z.infer<typeof profileUpdateSchema>
