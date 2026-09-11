import type { Buffet } from '../types/Buffet'

/**
 * SAMPLE / MOCK DATA ONLY.
 * These fictional listings, scores, dates, and review associations are UI fixtures.
 * They are not asserted to be restaurants reviewed by Mullet Review. Replace every
 * record with independently verified catalog data before treating the map as factual.
 */
export const buffets: Buffet[] = [
  
{
  id: 'nv-china-buffet-north-vernon-in',
  name: 'NV China Buffet',
  address: '1599 N State St',
  city: 'North Vernon',
  state: 'IN',
  postalCode: '47265',

  latitude: 39.005,
  longitude: -85.62,

  youtubeVideoId: '62Vya_ka5Q8',
  youtubeUrl: 'https://www.youtube.com/watch?v=62Vya_ka5Q8',

  yelpUrl: 'https://www.yelp.com/biz/...',
  yelpRating: 3.5,
  yelpReviewCount: 123,

  buffetType: 'Chinese',
  isOpen: true
},
]
