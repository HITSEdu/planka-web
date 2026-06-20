import { REFRESH_TOKEN_KEY } from '@constants/api'
import { PROTECTED_ROUTES, PUBLIC_ROUTES, Routes } from '@constants/routes'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { NextRequest, NextResponse } from 'next/server'

const locales = ['en', 'ru']
const defaultLocale = 'en'

// Get the preferred locale, similar to the above or using a library
function getLocale(request: NextRequest) {
  try {
    const headers = Object.fromEntries(request.headers.entries())
    const languages = new Negotiator({ headers }).languages()

    const baseLanguages = languages.map((l) => l.split('-')[0])
    return match(baseLanguages, locales, defaultLocale)
  } catch {
    return 'en'
  }
}

function getPathLocale(pathname: string, request: NextRequest) {
  return (
    locales.find((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) ??
    getLocale(request)
  )
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isRootPath = locales.some((locale) => pathname === `/${locale}`) || pathname === '/'

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.includes(route))
  const isPrivate = PROTECTED_ROUTES.some((route) => pathname.includes(route))

  const tokenRefresh = request.cookies.get(REFRESH_TOKEN_KEY)?.value
  const pathLocale = getPathLocale(pathname, request)

  if (isRootPath) {
    const url = request.nextUrl.clone()
    url.pathname = `/${pathLocale}/${tokenRefresh ? Routes.Profile : Routes.Login}`
    return NextResponse.redirect(url)
  }

  if (isPublic && tokenRefresh) {
    const url = request.nextUrl.clone()
    url.pathname = `/${pathLocale}/${Routes.Profile}`
    return NextResponse.redirect(url)
  }

  if (isPrivate && !tokenRefresh) {
    const url = request.nextUrl.clone()
    url.pathname = `/${pathLocale}/${Routes.Login}`
    return NextResponse.redirect(url)
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (pathnameHasLocale) return NextResponse.next()

  const locale = getLocale(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`

  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.well-known|sitemap.xml|robots.txt|.*\\.png$).*)'],
}
