import type { Dictionary } from '@/shared/config/dictionaries'

import { Status } from '@constants/api'

type AuthErrorsDictionary = Dictionary['auth']['errors']

const apiErrorMap: Record<string, keyof AuthErrorsDictionary> = {
  'email and password are required': 'required',
  'email and password with at least 8 characters are required': 'passwordMin',
  'invalid email or password': 'invalidCredentials',
  'user already exists': 'userExists',
  UNAUTHORIZED: 'invalidCredentials',
  ERROR: 'unknown',
  INTERNAL_SERVICE: 'network',
  VALIDATION: 'validation',
}

export const getAuthErrorMessage = (error: unknown, dict: AuthErrorsDictionary) => {
  const rawMessage = getRawErrorMessage(error)

  if (!rawMessage) {
    return dict.unknown
  }

  const key = getDictionaryKey(error, rawMessage)

  return dict[key] ?? dict.unknown
}

const getDictionaryKey = (error: unknown, rawMessage: string): keyof AuthErrorsDictionary => {
  const exactKey = apiErrorMap[rawMessage] ?? apiErrorMap[rawMessage.toLowerCase()]

  if (exactKey) {
    return exactKey
  }

  if (error && typeof error === 'object') {
    const code = 'code' in error ? String(error.code) : ''
    const format = 'format' in error ? String(error.format) : ''
    const origin = 'origin' in error ? String(error.origin) : ''
    const minimum = 'minimum' in error ? Number(error.minimum) : 0

    if (code === 'invalid_format' && format === 'email') {
      return 'email'
    }

    if (code === 'invalid_type' || code === 'too_small') {
      if (origin === 'string' && minimum >= 8) {
        return 'passwordMin'
      }

      return 'required'
    }
  }

  const message = rawMessage.toLowerCase()

  if (message.includes('email')) {
    return 'email'
  }

  if (message.includes('password') && message.includes('8')) {
    return 'passwordMin'
  }

  if (message.startsWith(Status.ValidationError)) {
    return 'validation'
  }

  return 'unknown'
}

const getRawErrorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }

  return typeof error === 'string' ? error : ''
}
