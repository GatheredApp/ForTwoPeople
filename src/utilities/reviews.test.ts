import { describe, expect, it } from 'vitest'
import type { Buffet } from '../types/Buffet'
import { averageRating, createReviewIssueUrl, emptyReviewDraft, findReviewMatches, reviewPayload, validateReviewDraft } from './reviews'
const buffet = { id:'test-buffet-a-in',name:'Test Buffet',address:'1 Main St',city:'A',state:'IN',latitude:1,longitude:1 } as Buffet
const valid = { ...emptyReviewDraft, name:'Test Buffet',address:'1 Main St',city:'A',state:'IN',displayName:'Dom',rating:4,review:'A sufficiently detailed review.' }
describe('community review browser utilities',()=>{
  it('supports linked and unlisted submissions',()=>{expect(reviewPayload({...valid,buffetId:buffet.id})?.buffetId).toBe(buffet.id);expect(reviewPayload(valid)?.buffet.name).toBe('Test Buffet')})
  it('validates required rating, length, and future date',()=>{expect(validateReviewDraft({...valid,rating:6}).rating).toBeTruthy();expect(validateReviewDraft({...valid,review:'short'}).review).toBeTruthy();expect(validateReviewDraft({...valid,review:'x'.repeat(2001)}).review).toBeTruthy();expect(validateReviewDraft({...valid,visitDate:'2999-01-01'}).visitDate).toBeTruthy()})
  it('creates a safe GitHub URL with the exact marker and explains unlisted reviews',()=>{const url=new URL(createReviewIssueUrl(reviewPayload(valid)!));expect(url.origin+url.pathname).toBe('https://github.com/GatheredApp/ForTwoPeople/issues/new');expect(url.searchParams.get('body')).toContain('<!-- REVIEW_PUBLIC_SUBMISSION_V1\n');expect(url.searchParams.get('body')).toContain('REVIEW_PUBLIC_SUBMISSION_END -->');expect(url.searchParams.get('body')).toContain('does not create a map marker')})
  it('matches only exact unique identifying fields',()=>{expect(findReviewMatches(valid,[buffet])).toEqual([buffet]);expect(findReviewMatches({...valid,name:'Other'},[buffet])).toEqual([]);expect(findReviewMatches({...valid,address:''},[buffet,{...buffet,id:'other'}])).toHaveLength(2)})
  it('calculates linked review averages',()=>expect(averageRating([{rating:4},{rating:5},{rating:3}] as never)).toBe(4))
})
