import { Route } from 'next'

export enum Routes {
  Login = 'login',
  Profile = 'profile',
}

export const getRelativeRoute = (route: Route) => `../${route}`

export const PROTECTED_ROUTES = [Routes.Profile] as const
export const PUBLIC_ROUTES = [Routes.Login] as const
