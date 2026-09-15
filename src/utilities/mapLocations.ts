import type { Buffet } from '../types/Buffet'
import type { CommunityReview,ReviewBuffetSnapshot } from '../types/CommunityReview'
import type { FacebookReview,FacebookReviewBuffetSnapshot } from '../types/FacebookReview'
import type { MapLocation } from '../types/MapLocation'
import { averageRating } from './reviews'
const norm=(v='')=>v.trim().toLowerCase().replace(/[^a-z0-9]/g,'')
type Snapshot=ReviewBuffetSnapshot|FacebookReviewBuffetSnapshot|Buffet
// Postal codes are deliberately not part of the identity. Older snapshots often
// omit them, and a harmless ZIP formatting difference must not create a marker.
const same=(a:Snapshot,b:Snapshot)=>norm(a.name)===norm(b.name)&&norm(a.address)===norm(b.address)&&norm(a.city)===norm(b.city)&&norm(a.state)===norm(b.state)
export function matchingBuffet(review:{buffetId?:string;buffet:Snapshot},buffets:Buffet[]){if(review.buffetId)return buffets.find(b=>b.id===review.buffetId);const m=buffets.filter(b=>same(b,review.buffet));return m.length===1?m[0]:undefined}
export function buildMapLocations(buffets:Buffet[],reviews:CommunityReview[],facebook:FacebookReview[]=[]):MapLocation[]{
 const result:MapLocation[]=buffets.map(buffet=>({...buffet,kind:'mullet',buffet,communityReviews:[],facebookReviews:[]}));
 const communities=new Map<string,Extract<MapLocation,{kind:'community'}>>();
 for(const review of reviews){const mullet=matchingBuffet(review,buffets);if(mullet){result.find(x=>x.id===mullet.id)!.communityReviews.push(review);continue}if(!review.communityLocationId)continue;let loc=communities.get(review.communityLocationId);if(!loc&&review.buffet.address&&Number.isFinite(review.buffet.latitude)&&Number.isFinite(review.buffet.longitude)){loc={kind:'community',id:review.communityLocationId,communityLocationId:review.communityLocationId,name:review.buffet.name,address:review.buffet.address,city:review.buffet.city,state:review.buffet.state,...(review.buffet.postalCode?{postalCode:review.buffet.postalCode}:{}),latitude:review.buffet.latitude!,longitude:review.buffet.longitude!,...(review.buffet.yelpUrl?{yelpUrl:review.buffet.yelpUrl}:{}),communityReviews:[],facebookReviews:[]};communities.set(review.communityLocationId,loc);result.push(loc)}loc?.communityReviews.push(review)}
 const fbOnly=new Map<string,Extract<MapLocation,{kind:'facebook'}>>();
 for(const review of facebook){
  // Prefer verified identifiers written by ingestion. Snapshot matching remains
  // essential for dynamic promotion when a higher-priority source is added later.
  let target=review.buffetId?result.find(x=>x.kind==='mullet'&&x.id===review.buffetId):undefined
  if(!target)target=result.find(x=>x.kind==='mullet'&&same(x,review.buffet))
  if(!target&&review.communityLocationId)target=result.find(x=>x.kind==='community'&&x.communityLocationId===review.communityLocationId)
  if(!target)target=result.find(x=>x.kind==='community'&&same(x,review.buffet))
  if(target){target.facebookReviews.push(review);continue}
  const id=review.facebookLocationId
  if(!id)continue
  let loc=fbOnly.get(id)
  if(!loc){const b=review.buffet;loc={kind:'facebook',id,facebookLocationId:id,...b,communityReviews:[],facebookReviews:[]};fbOnly.set(id,loc);result.push(loc)}
  loc.facebookReviews.push(review)
 }
 return result
}
export function filterMapLocations(items:MapLocation[],query:string){const n=query.trim().toLowerCase();return n?items.filter(i=>[i.name,i.address,i.city,i.state,i.kind==='mullet'?i.buffet.buffetType:'',...i.communityReviews.flatMap(r=>[r.review,r.displayName])].some(v=>v?.toLowerCase().includes(n))):items}
export const communityAverage=(location:MapLocation)=>averageRating(location.communityReviews)
