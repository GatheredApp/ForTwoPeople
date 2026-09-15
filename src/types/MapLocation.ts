import type { Buffet } from './Buffet'
import type { CommunityReview } from './CommunityReview'
import type { FacebookReview } from './FacebookReview'

interface LocationBase { id: string; name: string; address: string; city: string; state: string; postalCode?: string; latitude: number; longitude: number; yelpUrl?: string; communityReviews: CommunityReview[]; facebookReviews: FacebookReview[] }
export type MapLocation =
  | (LocationBase & { kind: 'mullet'; buffet: Buffet })
  | (LocationBase & { kind: 'community'; communityLocationId: string })
  | (LocationBase & { kind: 'facebook'; facebookLocationId: string })
