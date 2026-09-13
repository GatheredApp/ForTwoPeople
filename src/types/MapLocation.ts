import type { Buffet } from './Buffet'
import type { CommunityReview } from './CommunityReview'

interface LocationBase { id: string; name: string; address: string; city: string; state: string; postalCode?: string; latitude: number; longitude: number; yelpUrl?: string; communityReviews: CommunityReview[] }
export type MapLocation =
  | (LocationBase & { kind: 'mullet'; buffet: Buffet })
  | (LocationBase & { kind: 'community'; communityLocationId: string })
