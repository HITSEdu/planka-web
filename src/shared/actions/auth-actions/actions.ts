'use server'

import { LoginRequestType, authApi } from '@api/auth-api'
import { Routes, getRelativeRoute } from '@constants/routes'
import { clearRefreshTokenFromCookies, setRefreshTokenToCookies, withAction } from '@server'
import { redirect } from 'next/navigation'

export const loginAction = withAction(async (dto: LoginRequestType) => {
  const data = await authApi.login(dto)

  await setRefreshTokenToCookies(data.refreshToken)

  return {
    accessToken: data.accessToken,
  }
})

export const logoutAction = withAction(async () => {
  await authApi.logout()
  await clearRefreshTokenFromCookies()

  redirect(getRelativeRoute(Routes.Login))
})
