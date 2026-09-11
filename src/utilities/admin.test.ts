import { describe, expect, it } from 'vitest'
import type { Buffet } from '../types/Buffet'
import { createIssueBody, createIssueUrl, createPublicIssueBody, createPublicIssueUrl, emptyDraft, extractYouTubeId, findDuplicates, generateBuffetId, normalizeDraft, validateDraft } from './admin'

const validDraft = { ...emptyDraft, name: 'Test Buffet', address: '123 Test St', city: 'Example', state: 'IN', id: 'test-buffet-example-in', latitude: '39.1', longitude: '-85.2', youtubeUrl: 'https://youtu.be/62Vya_ka5Q8' }

describe('admin buffet utilities', () => {
  it('generates a punctuation-safe buffet ID', () => {
    expect(generateBuffetId('NV China Buffet', 'North Vernon', 'IN')).toBe('nv-china-buffet-north-vernon-in')
    expect(generateBuffetId("Chef's  Buffet!!!", 'St. Louis', 'MO')).toBe('chef-s-buffet-st-louis-mo')
  })

  it.each(['https://youtu.be/62Vya_ka5Q8', 'https://www.youtube.com/watch?v=62Vya_ka5Q8', 'https://youtube.com/shorts/62Vya_ka5Q8'])('extracts a YouTube ID from %s', (url) => {
    expect(extractYouTubeId(url)).toBe('62Vya_ka5Q8')
  })

  it('normalizes form data and omits empty optional properties', () => {
    const record = normalizeDraft({ ...validDraft, rangoonRating: '5', isOpen: 'closed' })
    expect(record).toMatchObject({ youtubeVideoId: '62Vya_ka5Q8', youtubeUrl: 'https://www.youtube.com/watch?v=62Vya_ka5Q8', rangoonRating: 5, isOpen: false })
    expect(record).not.toHaveProperty('notes')
    expect(validateDraft({ ...validDraft, latitude: '91' }).latitude).toMatch(/-90/)
  })

  it('detects every protected duplicate type', () => {
    const record = normalizeDraft(validDraft)!
    const existing: Buffet[] = [{ ...record }]
    expect(findDuplicates(record, existing)).toEqual(expect.arrayContaining([expect.stringContaining('ID'), expect.stringContaining('video ID'), expect.stringContaining('name and address'), expect.stringContaining('coordinates')]))
  })

  it('creates a safely encoded issue URL with the exact hidden JSON payload', () => {
    const record = normalizeDraft(validDraft)!
    const body = createIssueBody(record)
    const payload = body.match(/<!-- BUFFET_SUBMISSION_V1\n([\s\S]+)\nBUFFET_SUBMISSION_END -->/)?.[1]
    expect(JSON.parse(payload!)).toEqual(record)
    const issueUrl = new URL(createIssueUrl(record))
    expect(issueUrl.origin + issueUrl.pathname).toBe('https://github.com/GatheredApp/ForTwoPeople/issues/new')
    expect(issueUrl.searchParams.get('body')).toBe(body)
  })

  it('creates a distinct public issue payload and omits the owner rating', () => {
    const record = normalizeDraft({ ...validDraft, rangoonRating: '5' }, false)!
    expect(record).not.toHaveProperty('rangoonRating')
    const body = createPublicIssueBody(record)
    expect(body).toContain('BUFFET_PUBLIC_SUBMISSION_V1')
    expect(body).not.toContain('BUFFET_SUBMISSION_V1\n')
    const issueUrl = new URL(createPublicIssueUrl(record))
    expect(issueUrl.searchParams.get('title')).toBe('Buffet submission: Test Buffet — Example, IN')
    expect(issueUrl.searchParams.get('body')).toBe(body)
  })
})
