import { profileApi } from '@api/profile-api'
import { PROFILE_TAGS } from '@constants/api'
import { useQuery } from '@tanstack/react-query'

export function useGetProfile() {
  const { data, isLoading, isError } = useQuery({
    queryKey: PROFILE_TAGS.getProfile,
    queryFn: profileApi.getProfile,
  })

  return {
    data,
    isLoading,
    isError,
  }
}
