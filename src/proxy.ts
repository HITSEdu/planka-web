import { REFRESH_TOKEN_KEY } from '@constants/api'
import { PROTECTED_ROUTES, PUBLIC_ROUTES, Routes } from '@constants/routes'
import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isRootPath =  pathname === '/'

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.includes(route))
  const isPrivate = PROTECTED_ROUTES.some((route) => pathname.includes(route))

  const tokenRefresh = request.cookies.get(REFRESH_TOKEN_KEY)?.value

  if ((isPublic && tokenRefresh) || isRootPath) {
    const url = request.nextUrl.clone()
    url.pathname = Routes.Profile
    return NextResponse.redirect(url)
  }

  if ((isPrivate && !tokenRefresh) || isRootPath) {
    const url = request.nextUrl.clone()
    url.pathname = Routes.Login
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.well-known|sitemap.xml|robots.txt|.*\\.png$).*)'],
}
