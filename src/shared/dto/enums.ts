import z from 'zod'

export const GenderEnum = z.enum(['Male', 'Female', 'NotDefined'])