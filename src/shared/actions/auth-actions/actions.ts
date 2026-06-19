'use server'

import { LoginRequestType, RegisterRequestType, authApi } from '@api/auth-api'
import { setRefreshTokenToCookies, withAction } from '@server'

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
