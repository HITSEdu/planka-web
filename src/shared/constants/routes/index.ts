export enum Routes {
  Login = 'login',
  Register = 'register',
  Profile = 'profile',
  Timeline = 'timeline',
  Settings = 'settings',
  Schedule = 'schedule',
  Friends = 'friends',
}

export const getRouteWithParam = (route: Routes, param: string, level: number = 1) =>
  `${Array.from({ length: level }, () => '../').join('')}${route}/${param}`

export const getRelativeRoute = (route: Routes, level: number = 1) =>
  `${Array.from({ length: level }, () => '../').join('')}${route}`

export const PROTECTED_ROUTES = [
  Routes.Profile,
  Routes.Timeline,
  Routes.Settings,
  Routes.Schedule,
  Routes.Friends,
] as const
export const PUBLIC_ROUTES = [Routes.Login, Routes.Register] as const
