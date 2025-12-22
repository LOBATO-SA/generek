export type UserType = 'artist' | 'listener'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  user_type: UserType
  avatar_url?: string
  created_at?: string
}
