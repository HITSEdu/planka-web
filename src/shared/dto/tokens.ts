import z from 'zod'

export const TokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export type TokenPairType = z.infer<typeof TokenPairSchema>
