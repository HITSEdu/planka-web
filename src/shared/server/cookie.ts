'use server'

import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_EXPIRES_DAYS, REFRESH_TOKEN_KEY } from '@constants/api'
import { getExpiresDate } from '@utils'
import { cookies } from 'next/headers'

const cookieOptions = (value?: number, unit: 'days' | 'minutes' = 'days') => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  ...(value !== undefined ? { expires: getExpiresDate(value, unit) } : {}),
})

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_TOKEN_KEY)?.value ?? null
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_TOKEN_KEY)?.value ?? null
}

export async function setRefreshTokenToCookies(token: string) {
  const cookieStore = await cookies()

  cookieStore.set(REFRESH_TOKEN_KEY, token, cookieOptions(REFRESH_TOKEN_EXPIRES_DAYS, 'days'))
}

export async function clearRefreshTokenFromCookies() {
  const cookieStore = await cookies()

  cookieStore.delete(REFRESH_TOKEN_KEY)
}
