import { Status } from '@constants/api'
import {
  clearRefreshTokenFromCookies,
  getRefreshToken,
  setRefreshTokenToCookies,
  tryRefresh,
} from '@server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const refreshToken = await getRefreshToken()

    if (!refreshToken) {
      return NextResponse.json({ error: Status.Unauthorized }, { status: 401 })
    }

    const refreshed = await tryRefresh()

    if (!refreshed) {
      await clearRefreshTokenFromCookies()
      return NextResponse.json({ error: Status.Unauthorized }, { status: 401 })
    }

    await setRefreshTokenToCookies(refreshed.refreshToken)
    return NextResponse.json(refreshed)
  } catch {
    return NextResponse.json({ error: Status.InternalError }, { status: 500 })
  }
}
