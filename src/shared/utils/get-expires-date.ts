export function getExpiresDate(value: number, unit: 'days' | 'minutes'): Date {
  const date = new Date()
  if (unit === 'days') {
    date.setDate(date.getDate() + value)
  } else if (unit === 'minutes') {
    date.setMinutes(date.getMinutes() + value)
  }
  return date
}
