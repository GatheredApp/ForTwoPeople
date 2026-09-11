import { readFile, writeFile } from 'node:fs/promises'
import { US_STATES } from './buffet-validation.mjs'

const PUBLIC_KEYS = new Set(['buffetId','buffet','displayName','rating','review','visitDate','wouldReturn'])
const BUFFET_KEYS = new Set(['name','address','city','state','postalCode'])
const RECORD_KEYS = new Set([...PUBLIC_KEYS,'id','githubUser','submittedAt','sourceIssueNumber'])
const text = (value, min, max) => typeof value === 'string' && value.trim().length >= min && value.trim().length <= max
const dateValid = (value, futureAllowed = false) => { if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false; const d = new Date(`${value}T00:00:00Z`); return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0,10) === value && (futureAllowed || value <= new Date().toISOString().slice(0,10)) }

export function extractReviewSubmission(body) {
  if (typeof body !== 'string' || body.length > 100_000) throw new Error('Review submission is missing or too large.')
  const matches = [...body.matchAll(/<!-- REVIEW_PUBLIC_SUBMISSION_V1\s*\n([\s\S]*?)\nREVIEW_PUBLIC_SUBMISSION_END -->/g)]
  if (matches.length !== 1) throw new Error(matches.length ? 'Multiple review submission payloads are not allowed.' : 'Review submission markers are missing or malformed.')
  if (matches[0][1].length > 10_000) throw new Error('Review submission JSON is too large.')
  try { const value = JSON.parse(matches[0][1]); if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(); return value } catch { throw new Error('Review submission contains invalid JSON.') }
}
export function validatePublicReview(value) {
  const errors = []
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ['Review must be an object.']
  for (const k of Object.keys(value)) if (!PUBLIC_KEYS.has(k)) errors.push(`Review contains unsupported property: ${k}.`)
  if (!value.buffet || typeof value.buffet !== 'object' || Array.isArray(value.buffet)) errors.push('Buffet snapshot is required.')
  else { for (const k of Object.keys(value.buffet)) if (!BUFFET_KEYS.has(k)) errors.push(`Buffet contains unsupported property: ${k}.`); if (!text(value.buffet.name,1,120)) errors.push('Buffet name is required and must be at most 120 characters.'); if (!text(value.buffet.city,1,80)) errors.push('Buffet city is required and must be at most 80 characters.'); if (!US_STATES.has(value.buffet.state)) errors.push('Buffet state must be a valid U.S. abbreviation.'); if ('address' in value.buffet && !text(value.buffet.address,1,160)) errors.push('Buffet address must be 1–160 characters.'); if ('postalCode' in value.buffet && !text(value.buffet.postalCode,1,12)) errors.push('Postal code must be 1–12 characters.') }
  if ('buffetId' in value && (typeof value.buffetId !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.buffetId))) errors.push('buffetId must be lowercase kebab case.')
  if (!text(value.displayName,1,50)) errors.push('Display name must be 1–50 characters.')
  if (!Number.isInteger(value.rating) || value.rating < 1 || value.rating > 5) errors.push('Rating must be an integer from 1 to 5.')
  if (!text(value.review,20,2000)) errors.push('Review text must be between 20 and 2,000 characters.')
  if ('visitDate' in value && !dateValid(value.visitDate)) errors.push('Visit date must be a real YYYY-MM-DD date that is not in the future.')
  if ('wouldReturn' in value && !['yes','no','unsure'].includes(value.wouldReturn)) errors.push('Would return must be yes, no, or unsure.')
  return errors
}
export function validateReviewRecord(value) {
  const errors = validatePublicReview(Object.fromEntries(Object.entries(value ?? {}).filter(([k]) => PUBLIC_KEYS.has(k))))
  if (!value || typeof value !== 'object') return errors
  for (const k of Object.keys(value)) if (!RECORD_KEYS.has(k)) errors.push(`Review contains unsupported property: ${k}.`)
  if (!/^review-github-issue-\d+$/.test(value.id ?? '')) errors.push('Review id must be server-derived from its issue number.')
  if (typeof value.githubUser !== 'string' || !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(value.githubUser)) errors.push('GitHub user is invalid.')
  if (!Number.isInteger(value.sourceIssueNumber) || value.sourceIssueNumber < 1) errors.push('Source issue number is invalid.')
  if (typeof value.submittedAt !== 'string' || Number.isNaN(Date.parse(value.submittedAt))) errors.push('Submission timestamp is invalid.')
  return errors
}
export function validateReviewDataset(records) { if (!Array.isArray(records)) return ['Review dataset must be an array.']; const errors = records.flatMap((r,i) => validateReviewRecord(r).map(e => `Review at index ${i}: ${e}`)); const ids = new Set(), issues = new Set(); records.forEach(r => { if (ids.has(r.id)) errors.push(`Duplicate review id: ${r.id}.`); if (issues.has(r.sourceIssueNumber)) errors.push(`Duplicate source issue: ${r.sourceIssueNumber}.`); ids.add(r.id); issues.add(r.sourceIssueNumber) }); return errors }
const norm = (v='') => v.trim().toLowerCase().replace(/[^a-z0-9]/g,'')
export function resolveBuffet(candidate, buffets) { if (candidate.buffetId) { const found = buffets.find(b => b.id === candidate.buffetId); if (!found) throw new Error('Submitted buffetId does not exist.'); return found } const matches = buffets.filter(b => norm(b.name)===norm(candidate.buffet.name) && norm(b.city)===norm(candidate.buffet.city) && b.state===candidate.buffet.state && (!candidate.buffet.address || norm(b.address)===norm(candidate.buffet.address))); return matches.length === 1 ? matches[0] : undefined }
export async function appendReview(event, reviewsPath, buffetsPath) { const candidate = extractReviewSubmission(event.issue.body); const errors = validatePublicReview(candidate); if (errors.length) throw new Error(errors[0]); const buffets=JSON.parse(await readFile(buffetsPath,'utf8')); const linked=resolveBuffet(candidate,buffets); if (!linked && !candidate.buffet.address) throw new Error('Street address is required for a buffet not linked to the map.'); const records=JSON.parse(await readFile(reviewsPath,'utf8')); const id=`review-github-issue-${event.issue.number}`; if (records.some(r => r.id===id || r.sourceIssueNumber===event.issue.number)) return { duplicate:true, id }; const buffet=linked ? {name:linked.name,address:linked.address,city:linked.city,state:linked.state,...(linked.postalCode?{postalCode:linked.postalCode}:{})} : candidate.buffet; const record={id,...(linked?{buffetId:linked.id}:{}),buffet,displayName:candidate.displayName,rating:candidate.rating,review:candidate.review,...(candidate.visitDate?{visitDate:candidate.visitDate}:{}),...(candidate.wouldReturn?{wouldReturn:candidate.wouldReturn}:{}),githubUser:event.issue.user.login,submittedAt:event.issue.created_at,sourceIssueNumber:event.issue.number}; const final=[...records,record]; const finalErrors=validateReviewDataset(final); if(finalErrors.length) throw new Error(finalErrors[0]); await writeFile(reviewsPath,`${JSON.stringify(final,null,2)}\n`); return record }
