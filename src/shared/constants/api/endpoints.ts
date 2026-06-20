const AUTH_ROOT = 'Auth'
const PROFILE_ROOT = 'Profile'

export const endpoints = {
  innerRefresh: 'api/auth/refresh',
  auth: {
    refresh: `${AUTH_ROOT}/refresh`,
    login: `${AUTH_ROOT}/login`,
    register: `${AUTH_ROOT}/register`,
    logout: `${AUTH_ROOT}/logout`,
  },
  profile: {
    profile: PROFILE_ROOT,
  },
  events: {
    root: '../events',
    byId: (id: string) => `../events/${id}`,
  },
  friends: {
    root: '../friends',
    requests: '../friends/requests',
    requestById: (id: string) => `../friends/requests/${id}`,
    acceptRequest: (id: string) => `../friends/requests/${id}/accept`,
    byId: (id: string) => `../friends/${id}`,
    events: (id: string) => `../friends/${id}/events`,
  },
  tags: {
    root: '../tags',
    byId: (id: string) => `../tags/${id}`,
  },
} as const
