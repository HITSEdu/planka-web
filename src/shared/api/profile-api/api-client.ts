import { withApiSafe } from '@api-client'
import { endpoints } from '@constants/api'
import { profileSchema } from '@dto'

export const profileApi = {
  getProfile: withApiSafe((api) => api.get(endpoints.profile.profile, profileSchema)),
}
