import { LoginRequestType, LoginResponseSchema, RegisterRequestType } from './dto'

import { withApi } from '@api-client'
import { endpoints } from '@constants/api'

export const authApi = {
  login: withApi((api, dto: LoginRequestType) =>
    api.post(endpoints.auth.login, dto, LoginResponseSchema),
  ),
  register: withApi((api, dto: RegisterRequestType) =>
    api.post(endpoints.auth.register, dto, LoginResponseSchema),
  ),

  logout: withApi((api) => api.post(endpoints.auth.logout)),
}
