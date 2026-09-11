import type { Buffet } from '../types/Buffet'
import type { CommunityReview, ReviewBuffetSnapshot } from '../types/CommunityReview'

export const REVIEW_MARKER_START = 'REVIEW_PUBLIC_SUBMISSION_V1'
export const REVIEW_MARKER_END = 'REVIEW_PUBLIC_SUBMISSION_END'
export const REVIEW_DRAFT_KEY = 'fortwopeople-community-review-draft-v1'
export const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

export interface ReviewDraft { buffetId: string; name: string; address: string; city: string; state: string; postalCode: string; displayName: string; rating: number; review: string; visitDate: string; wouldReturn: '' | 'yes' | 'no' | 'unsure' }
export const emptyReviewDraft: ReviewDraft = { buffetId: '', name: '', address: '', city: '', state: '', postalCode: '', displayName: '', rating: 0, review: '', visitDate: '', wouldReturn: '' }
const norm = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
export const snapshotFromBuffet = (b: Buffet): ReviewBuffetSnapshot => ({ name: b.name, address: b.address, city: b.city, state: b.state, ...(b.postalCode ? { postalCode: b.postalCode } : {}) })

export function findReviewMatches(draft: Pick<ReviewDraft, 'name'|'city'|'state'|'address'>, buffets: Buffet[]) {
  if (!draft.name.trim() || !draft.city.trim() || !draft.state) return []
  return buffets.filter((b) => norm(b.name) === norm(draft.name) && norm(b.city) === norm(draft.city) && b.state === draft.state && (!draft.address.trim() || norm(b.address) === norm(draft.address)))
}

export function validateReviewDraft(d: ReviewDraft) {
  const errors: Partial<Record<keyof ReviewDraft, string>> = {}
  if (!d.name.trim()) errors.name = 'Buffet name is required.'; else if (d.name.trim().length > 120) errors.name = 'Use 120 characters or fewer.'
  if (!d.city.trim()) errors.city = 'City is required.'; else if (d.city.trim().length > 80) errors.city = 'Use 80 characters or fewer.'
  if (!US_STATES.includes(d.state)) errors.state = 'Select a valid U.S. state.'
  if (!d.buffetId && !d.address.trim()) errors.address = 'Street address is required when the buffet is not linked to the map.'
  if (d.address.trim().length > 160) errors.address = 'Use 160 characters or fewer.'
  if (!d.displayName.trim() || d.displayName.trim().length > 50) errors.displayName = 'Enter a display name of 1–50 characters.'
  if (!Number.isInteger(d.rating) || d.rating < 1 || d.rating > 5) errors.rating = 'Choose a rating from 1 to 5.'
  const length = d.review.trim().length
  if (length < 20 || length > 2000) errors.review = 'Review must be between 20 and 2,000 characters.'
  if (d.visitDate) { const date = new Date(`${d.visitDate}T00:00:00Z`); if (!/^\d{4}-\d{2}-\d{2}$/.test(d.visitDate) || Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== d.visitDate || d.visitDate > new Date().toISOString().slice(0, 10)) errors.visitDate = 'Visit date must be a real date that is not in the future.' }
  return errors
}

export function reviewPayload(d: ReviewDraft) {
  if (Object.keys(validateReviewDraft(d)).length) return null
  return { ...(d.buffetId ? { buffetId: d.buffetId } : {}), buffet: { name: d.name.trim(), ...(d.address.trim() ? { address: d.address.trim() } : {}), city: d.city.trim(), state: d.state, ...(d.postalCode.trim() ? { postalCode: d.postalCode.trim() } : {}) }, displayName: d.displayName.trim(), rating: d.rating, review: d.review.trim(), ...(d.visitDate ? { visitDate: d.visitDate } : {}), ...(d.wouldReturn ? { wouldReturn: d.wouldReturn } : {}) }
}

export function createReviewIssueUrl(payload: NonNullable<ReturnType<typeof reviewPayload>>) {
  const title = `Community review: ${payload.buffet.name} — ${payload.buffet.city}, ${payload.buffet.state}`
  const visited = payload.visitDate ? new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${payload.visitDate}T00:00:00Z`)) : 'Not provided'
  const body = `## Community review submission\n\n**Buffet:** ${payload.buffet.name}  \n**Location:** ${payload.buffet.city}, ${payload.buffet.state}  \n${payload.buffet.address ? `**Address:** ${payload.buffet.address}  \n` : ''}**Display name:** ${payload.displayName}  \n**Rating:** ${payload.rating}/5  \n**Visited:** ${visited}  \n**Would return:** ${payload.wouldReturn ? payload.wouldReturn[0].toUpperCase() + payload.wouldReturn.slice(1) : 'Not provided'}\n\n### Review\n\n${payload.review}\n\nSubmitted through the For Two People Post Your Review form.\n\n### What happens next\n\nThis review is awaiting moderation by GatheredApp. If approved, it will appear on the site.\n\n<!-- ${REVIEW_MARKER_START}\n${JSON.stringify(payload, null, 2)}\n${REVIEW_MARKER_END} -->`
  const url = new URL('https://github.com/GatheredApp/ForTwoPeople/issues/new'); url.searchParams.set('title', title); url.searchParams.set('body', body); return url.toString()
}

export const reviewsForBuffet = (items: CommunityReview[], id: string) => items.filter((r) => r.buffetId === id)
export const averageRating = (items: CommunityReview[]) => items.length ? Math.round(items.reduce((sum, r) => sum + r.rating, 0) / items.length * 10) / 10 : 0
