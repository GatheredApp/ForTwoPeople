export interface Buffet {
  id: string
  name: string
  address: string
  city: string
  state: string
  postalCode?: string
  latitude: number
  longitude: number
  youtubeVideoId?: string
  youtubeUrl?: string
  reviewDate?: string
  yelpUrl?: string
  yelpRating?: number
  yelpReviewCount?: number
  reviewerRating?: number
  buffetType?: string
  price?: string
  isOpen?: boolean
  notes?: string
}
