export const PROFILE_TAGS = {
  getProfile: ['profile'],
}

export const EVENTS_TAGS = {
  root: ['events'],
  list: (tagName?: string) => ['events', tagName ?? 'all'],
}

export const FRIENDS_TAGS = {
  root: ['friends'],
  overview: ['friends', 'overview'],
  events: (friendId: string) => ['friends', 'events', friendId],
}

export const TAGS_TAGS = {
  list: ['tags'],
}
