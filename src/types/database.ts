export type UserRow = {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export type ProfileRow = {
  id: string
  user_id: string
  display_name: string | null
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  phone: string | null
  city: string | null
  country: string | null
  bio: string | null
  website: string | null
  linked_in: string | null
  created_at: string
  updated_at: string
}
