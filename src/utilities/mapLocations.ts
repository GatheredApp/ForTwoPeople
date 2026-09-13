import type { Buffet } from '../types/Buffet'
import type { CommunityReview } from '../types/CommunityReview'
import type { MapLocation } from '../types/MapLocation'
import { averageRating } from './reviews'

const norm = (value = '') => value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
export function matchingBuffet(review: CommunityReview, buffets: Buffet[]) {
  if (review.buffetId) return buffets.find(({ id }) => id === review.buffetId)
  const matches = buffets.filter((b) => norm(b.name) === norm(review.buffet.name) && norm(b.city) === norm(review.buffet.city) && b.state === review.buffet.state && (!review.buffet.address || norm(b.address) === norm(review.buffet.address)))
  return matches.length === 1 ? matches[0] : undefined
}

export function buildMapLocations(buffets: Buffet[], reviews: CommunityReview[]): MapLocation[] {
  const assigned = new Map<string, CommunityReview[]>()
  const unlinked: CommunityReview[] = []
  reviews.forEach((review) => { const buffet = matchingBuffet(review, buffets); if (buffet) assigned.set(buffet.id, [...(assigned.get(buffet.id) ?? []), review]); else unlinked.push(review) })
  const result: MapLocation[] = buffets.map((buffet) => ({ ...buffet, kind:'mullet', buffet, communityReviews:assigned.get(buffet.id) ?? [] }))
  const groups = new Map<string, CommunityReview[]>()
  unlinked.forEach((review) => { if (review.communityLocationId) groups.set(review.communityLocationId, [...(groups.get(review.communityLocationId) ?? []), review]) })
  groups.forEach((items, communityLocationId) => {
    const b = items[0].buffet
    if (b.address && Number.isFinite(b.latitude) && Number.isFinite(b.longitude) && b.latitude! >= -90 && b.latitude! <= 90 && b.longitude! >= -180 && b.longitude! <= 180) result.push({ kind:'community', id:communityLocationId, communityLocationId, name:b.name, address:b.address, city:b.city, state:b.state, ...(b.postalCode?{postalCode:b.postalCode}:{}), latitude:b.latitude!, longitude:b.longitude!, ...(b.yelpUrl?{yelpUrl:b.yelpUrl}:{}), communityReviews:items })
  })
  return result
}

export function filterMapLocations(items: MapLocation[], query: string) {
  const needle=query.trim().toLowerCase(); if(!needle) return items
  return items.filter((item) => [item.name,item.address,item.city,item.state,item.kind==='mullet'?item.buffet.buffetType:'',...item.communityReviews.flatMap(r=>[r.review,r.displayName])].some(v=>v?.toLowerCase().includes(needle)))
}
export const communityAverage = (location: MapLocation) => averageRating(location.communityReviews)
