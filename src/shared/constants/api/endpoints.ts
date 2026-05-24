const AUTH_ROOT = 'Auth'
const PROFILE_ROOT = 'Profile'

export const endpoints = {
  innerRefresh: 'api/auth/refresh',
  auth: {
    refresh: `${AUTH_ROOT}/refresh`,
    login: `${AUTH_ROOT}/login`,
    logout: `${AUTH_ROOT}/logout`,
  },
  profile: {
    profile: PROFILE_ROOT,
  },
} as const
