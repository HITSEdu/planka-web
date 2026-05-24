'use client'

import { useGetProfile } from '@api/profile-api/hooks'


export const ProfileWrapper = () => {
  const { data: profile } = useGetProfile()
  if (!profile?.data) return null

  const data = profile.data

  return (
    <div className="flex gap-5 w-full h-full">
      {data.email}
    </div>
  )
}
