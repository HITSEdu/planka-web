import { BASE_URL, endpoints } from '@constants/api'
import { TokenPairSchema } from '@dto'

export const fetchRefreshSession = async (refreshToken: string) => {
  try {
    const url = new URL(endpoints.auth.refresh, BASE_URL)
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const rawTokens = await response.json()

    return TokenPairSchema.parse(rawTokens)
  } catch {
    return null
  }
}
