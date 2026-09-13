import { describe,expect,it } from 'vitest'
import type { Buffet } from '../types/Buffet'
import type { CommunityReview } from '../types/CommunityReview'
import { buildMapLocations,filterMapLocations } from './mapLocations'
const buffet:Buffet={id:'royal-town-in',name:'Royal Buffet',address:'1 Main St',city:'Town',state:'IN',latitude:39,longitude:-86}
const review=(over:Partial<CommunityReview>={}):CommunityReview=>({id:'review-github-issue-1',communityLocationId:'community-location-aaaaaaaaaaaa',buffet:{name:'Community Buffet',address:'2 Main St',city:'Other',state:'IN',latitude:38,longitude:-85},displayName:'Dom',githubUser:'dom',rating:4,review:'Really useful community review text.',submittedAt:'2026-01-01T00:00:00Z',sourceIssueNumber:1,...over})
describe('map locations',()=>{
 it('keeps Mullet locations orange and attaches linked reviews without duplicates',()=>{const locations=buildMapLocations([buffet],[review({buffetId:buffet.id})]);expect(locations).toHaveLength(1);expect(locations[0]).toMatchObject({kind:'mullet',id:buffet.id});expect(locations[0].communityReviews).toHaveLength(1)})
 it('groups reviews sharing a community id into one blue location',()=>{const locations=buildMapLocations([],[review(),review({id:'review-github-issue-2',sourceIssueNumber:2,rating:2})]);expect(locations).toHaveLength(1);expect(locations[0]).toMatchObject({kind:'community',communityLocationId:'community-location-aaaaaaaaaaaa'});expect(locations[0].communityReviews).toHaveLength(2)})
 it('reconciles historical community reviews when a Mullet buffet is later added',()=>{const historical=review({buffet:{...buffet}});const locations=buildMapLocations([buffet],[historical]);expect(locations).toHaveLength(1);expect(locations[0].kind).toBe('mullet');expect(locations[0].communityReviews).toEqual([historical])})
 it('ignores old unlinked records without coordinates and searches community fields',()=>{expect(buildMapLocations([],[review({buffet:{name:'Old',city:'Town',state:'IN'}})])).toEqual([]);expect(filterMapLocations(buildMapLocations([],[review()]),'Other')).toHaveLength(1);expect(filterMapLocations(buildMapLocations([],[review()]),'Dom')).toHaveLength(1)})
})
