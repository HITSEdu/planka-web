'use server'

import { LoginRequestType, RegisterRequestType, authApi } from '@api/auth-api'
import { BASE_URL, endpoints } from '@constants/api'
import {
  clearRefreshTokenFromCookies,
  getRefreshToken,
  setRefreshTokenToCookies,
  withAction,
} from '@server'

export const loginAction = withAction(async (dto: LoginRequestType) => {
  const data = await authApi.login(dto)

  await setRefreshTokenToCookies(data.refreshToken)

  return {
    accessToken: data.accessToken,
  }
})

export const registerAction = withAction(async (dto: RegisterRequestType) => {
  const data = await authApi.register(dto)

  await setRefreshTokenToCookies(data.refreshToken)

  return {
    accessToken: data.accessToken,
  }
})

export const logoutAction = withAction(async () => {
  const refreshToken = await getRefreshToken()

  try {
    if (refreshToken) {
      const url = new URL(endpoints.auth.logout, BASE_URL)

      await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        cache: 'no-store',
      })
    }
  } finally {
    await clearRefreshTokenFromCookies()
  }
})
