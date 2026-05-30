import { TokenPairSchema } from '@dto'
import z from 'zod'

export const LoginRequestSchema = z.object({
  email: z.email(),
  password: z.string(),
})

export const RegisterRequestSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string(),
})

export type RegisterRequestType = z.infer<typeof RegisterRequestSchema>

export type LoginRequestType = z.infer<typeof LoginRequestSchema>

export const LoginResponseSchema = TokenPairSchema

export type LoginResponseType = z.infer<typeof LoginResponseSchema>
