import { TokenPairSchema } from '@dto'
import z from 'zod'

export const LoginRequestSchema = z.object({
  email: z.email(),
  password: z.string(),
})

export type LoginRequestType = z.infer<typeof LoginRequestSchema>

export const LoginResponseSchema = TokenPairSchema

export type LoginResponseType = z.infer<typeof LoginResponseSchema>
