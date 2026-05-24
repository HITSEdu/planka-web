'use server'

import {
  clearRefreshTokenFromCookies,
  getRefreshToken,
  setRefreshTokenToCookies,
} from '@/shared/server/cookie'
import { fetchRefreshSession } from '@api/refresh/outer'
import { TokenPairType } from '@dto'

let refreshPromise: Promise<TokenPairType | null> | null = null

export async function tryRefresh() {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

export async function doRefresh() {
  try {
    const refreshToken = await getRefreshToken()

    if (!refreshToken) {
      await clearRefreshTokenFromCookies()
      return null
    }

    const tokens = await fetchRefreshSession(refreshToken)

    if (!tokens) {
      await clearRefreshTokenFromCookies()
      return null
    }

    await setRefreshTokenToCookies(tokens.refreshToken)
    return tokens
  } catch {
    await clearRefreshTokenFromCookies()
    return null
  }
}
