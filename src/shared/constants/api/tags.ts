export const PROFILE_TAGS = {
  getProfile: ['profile'],
}

export const EVENTS_TAGS = {
  list: (tagName?: string) => ['events', tagName ?? 'all'],
}
