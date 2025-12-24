
export type UserType = 'artist' | 'listener'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  user_type: UserType
  avatar_url?: string
  created_at?: string
}

// Estados possíveis para o fluxo de contratação

// Artist Types
export interface Artist {
  id: string
  name: string
  avatar_url: string
  verified: boolean
  hourly_rate: number
  genre: string
  location: string
  rating: number
  total_bookings: number
  bio: string
  about?: string // Long description
  followers?: number
  available?: boolean
  experience?: string
  social_media?: {
    instagram?: string
    facebook?: string
  }
  available_events?: string[] // e.g. ["Wedding", "Corporate"]
}

// Booking Types
export type BookingStatus =
  | 'waiting_confirmation' // Artist needs to accept/reject
  | 'waiting_payment'      // Listener needs to pay
  | 'waiting_final_confirmation' // Final check before event
  | 'completed'            // Event done
  | 'cancelled'            // Cancelled
  | 'confirmed_by_artist'  // Intermediate state
  | 'paid'                 // Intermediate state

export interface Booking {
  id: string
  artist_id: string
  artist_name?: string // Optional if populated
  artist_avatar?: string // Optional if populated

  listener_id?: string
  listener_name?: string
  listener_avatar?: string

  event_type: string
  event_date: string // YYYY-MM-DD
  event_time: string // HH:MM
  duration_hours: number // changed from string duration
  location: string
  notes?: string

  status: BookingStatus
  total_price: number
  created_at: string

  // Frontend helpers (may not be in DB directly, but useful for logic)
  listener_confirmed?: boolean
  artist_confirmed?: boolean
  payment_done?: boolean
  listener_final_confirmed?: boolean
  artist_final_confirmed?: boolean
}

// DTO for Creating a Booking
export interface CreateBookingDTO {
  artist_id: string
  event_type: string
  event_date: string
  event_time: string
  duration_hours: number
  location: string
  notes?: string
}

