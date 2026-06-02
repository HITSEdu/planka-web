import z from 'zod'

export function parseFormData<T extends z.ZodTypeAny>(schema: T, formData: FormData): z.infer<T> {
  const raw = Object.fromEntries(formData.entries())
  return schema.parse(raw)
}
