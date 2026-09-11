export interface ReviewBuffetSnapshot {
  name: string
  city: string
  state: string
  address?: string
  postalCode?: string
}

export interface CommunityReview {
  id: string
  buffetId?: string
  buffet: ReviewBuffetSnapshot
  displayName: string
  githubUser: string
  rating: 1 | 2 | 3 | 4 | 5
  review: string
  visitDate?: string
  wouldReturn?: 'yes' | 'no' | 'unsure'
  submittedAt: string
  sourceIssueNumber: number
}
