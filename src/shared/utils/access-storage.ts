import { getExpiresDate } from '@/shared/utils/get-expires-date'
import { ACCESS_TOKEN_EXPIRES_MINUTES, ACCESS_TOKEN_KEY } from '@constants/api'
import Cookies from 'js-cookie'

export const accessStorage = {
  get: () => Cookies.get(ACCESS_TOKEN_KEY),
  set: (value: string) =>
    Cookies.set(ACCESS_TOKEN_KEY, value, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: getExpiresDate(ACCESS_TOKEN_EXPIRES_MINUTES, 'minutes'),
    }),
  remove: () => Cookies.remove(ACCESS_TOKEN_KEY, { path: '/' }),
  has: () => !!Cookies.get(ACCESS_TOKEN_KEY),
}
