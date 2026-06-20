import { endpoints } from '@constants/api'
import { TokenPairSchema } from '@dto'
import { accessStorage } from '@utils'

export const fetchRefreshSessionInner = async () => {
  try {
    const url = new URL(endpoints.innerRefresh, window.location.origin)
    const response = await fetch(url.toString(), {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      accessStorage.remove()
      return null
    }

    const rawTokens = await response.json()
    const tokens = TokenPairSchema.parse(rawTokens)

    accessStorage.set(tokens.accessToken)

    return tokens.accessToken
  } catch {
    return null
  }
}
