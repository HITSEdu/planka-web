export const PROFILE_TAGS = {
  getProfile: ['profile'],
}

export const EVENTS_TAGS = {
  root: ['events'],
  list: (tagName?: string) => ['events', tagName ?? 'all'],
}

export const TAGS_TAGS = {
  list: ['tags'],
}
