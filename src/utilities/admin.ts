import type { Buffet } from '../types/Buffet'

export const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'] as const

export type BuffetDraft = Record<'id' | 'name' | 'address' | 'city' | 'state' | 'postalCode' | 'latitude' | 'longitude' | 'youtubeUrl' | 'yelpUrl' | 'reviewDate' | 'buffetType' | 'price' | 'isOpen' | 'rangoonRating' | 'reviewerRating' | 'notes', string>

export const emptyDraft: BuffetDraft = { id: '', name: '', address: '', city: '', state: '', postalCode: '', latitude: '', longitude: '', youtubeUrl: '', yelpUrl: '', reviewDate: '', buffetType: '', price: '', isOpen: '', rangoonRating: '', reviewerRating: '', notes: '' }

export function generateBuffetId(name: string, city: string, state: string): string {
  return [name, city, state].join(' ').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function extractYouTubeId(value: string): string | null {
  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    let id = ''
    if (host === 'youtu.be') id = url.pathname.split('/')[1] ?? ''
    else if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (url.pathname === '/watch') id = url.searchParams.get('v') ?? ''
      else if (/^\/(shorts|embed)\//.test(url.pathname)) id = url.pathname.split('/')[2] ?? ''
    }
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
  } catch { return null }
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}

function validYelpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && (url.hostname === 'yelp.com' || url.hostname.endsWith('.yelp.com'))
  } catch { return false }
}

export function validateDraft(draft: BuffetDraft): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const field of ['name', 'address', 'city'] as const) if (!draft[field].trim()) errors[field] = 'This field is required.'
  if (!US_STATES.includes(draft.state as typeof US_STATES[number])) errors.state = 'Choose a valid U.S. state.'
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.id)) errors.id = 'Use lowercase letters and numbers separated by single hyphens.'
  const latitude = Number(draft.latitude)
  const longitude = Number(draft.longitude)
  if (!draft.latitude.trim() || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) errors.latitude = 'Enter a number between -90 and 90.'
  if (!draft.longitude.trim() || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) errors.longitude = 'Enter a number between -180 and 180.'
  if (!draft.youtubeUrl.trim() || !extractYouTubeId(draft.youtubeUrl)) errors.youtubeUrl = 'Enter a valid YouTube watch, short, or youtu.be URL.'
  if (draft.yelpUrl && !validYelpUrl(draft.yelpUrl)) errors.yelpUrl = 'Enter a valid HTTPS Yelp URL.'
  if (draft.reviewDate && !validDate(draft.reviewDate)) errors.reviewDate = 'Enter a real date in YYYY-MM-DD format.'
  if (draft.rangoonRating && !/^[1-5]$/.test(draft.rangoonRating)) errors.rangoonRating = 'Choose a rating from 1 to 5.'
  if (draft.reviewerRating && !Number.isFinite(Number(draft.reviewerRating))) errors.reviewerRating = 'Enter a numeric rating.'
  return errors
}

export function normalizeDraft(draft: BuffetDraft, includeOwnerRating = true): Buffet | null {
  if (Object.keys(validateDraft(draft)).length) return null
  const youtubeVideoId = extractYouTubeId(draft.youtubeUrl)!
  const record: Buffet = {
    id: draft.id.trim(), name: draft.name.trim(), address: draft.address.trim(), city: draft.city.trim(), state: draft.state,
    latitude: Number(draft.latitude), longitude: Number(draft.longitude), youtubeVideoId,
    youtubeUrl: `https://www.youtube.com/watch?v=${youtubeVideoId}`,
  }
  const strings = ['postalCode', 'yelpUrl', 'reviewDate', 'buffetType', 'price', 'notes'] as const
  for (const key of strings) if (draft[key].trim()) record[key] = draft[key].trim()
  if (draft.reviewerRating) record.reviewerRating = Number(draft.reviewerRating)
  if (includeOwnerRating && draft.rangoonRating) record.rangoonRating = Number(draft.rangoonRating) as Buffet['rangoonRating']
  if (draft.isOpen) record.isOpen = draft.isOpen === 'open'
  return record
}

const comparable = (value: string) => value.trim().toLocaleLowerCase().replace(/\s+/g, ' ')
export function findDuplicates(record: Buffet, existing: Buffet[]): string[] {
  const problems: string[] = []
  if (existing.some((item) => item.id === record.id)) problems.push(`Duplicate buffet ID: ${record.id}`)
  if (existing.some((item) => item.youtubeVideoId === record.youtubeVideoId)) problems.push(`Duplicate YouTube video ID: ${record.youtubeVideoId}`)
  if (existing.some((item) => comparable(item.name) === comparable(record.name) && comparable(item.address) === comparable(record.address))) problems.push('A buffet with the same name and address already exists.')
  if (existing.some((item) => item.latitude === record.latitude && item.longitude === record.longitude)) problems.push('A buffet with exactly the same coordinates already exists.')
  return problems
}

export function createIssueBody(record: Buffet): string {
  const json = JSON.stringify(record, null, 2)
  return `## Buffet submission\n\n**Name:** ${record.name}\n**Location:** ${record.city}, ${record.state}\n**YouTube:** ${record.youtubeUrl}\n**Yelp:** ${record.yelpUrl ?? 'Not provided'}\n\nSubmitted through the ForTwoPeople admin form.\n\n<!-- BUFFET_SUBMISSION_V1\n${json}\nBUFFET_SUBMISSION_END -->`
}

export function createIssueUrl(record: Buffet): string {
  const url = new URL('https://github.com/GatheredApp/ForTwoPeople/issues/new')
  url.search = new URLSearchParams({ title: `Add buffet: ${record.name} — ${record.city}, ${record.state}`, body: createIssueBody(record) }).toString()
  return url.toString()
}

export function createPublicIssueBody(record: Buffet): string {
  const json = JSON.stringify(record, null, 2)
  const lines = [
    '## Buffet submission', '', `**Name:** ${record.name}  `,
    `**Location:** ${record.city}, ${record.state}  `, `**Address:** ${record.address}  `,
    `**Coordinates:** ${record.latitude}, ${record.longitude}  `,
    `**YouTube:** [${record.youtubeUrl}](${record.youtubeUrl})  `,
    `**Yelp:** ${record.yelpUrl ? `[${record.yelpUrl}](${record.yelpUrl})` : 'Not provided'}  `,
  ]
  for (const [label, value] of [['Review date', record.reviewDate], ['Buffet type', record.buffetType], ['Price', record.price], ['Reviewer rating', record.reviewerRating], ['Notes', record.notes]]) {
    if (value !== undefined) lines.push(`**${label}:** ${value}  `)
  }
  lines.push('', 'Submitted through the For Two People public buffet submission form.', '', '### What happens next', '', 'This submission is awaiting review by GatheredApp. If approved, it will be added to the buffet map automatically.', '', `<!-- BUFFET_PUBLIC_SUBMISSION_V1\n${json}\nBUFFET_PUBLIC_SUBMISSION_END -->`)
  return lines.join('\n')
}

export function createPublicIssueUrl(record: Buffet): string {
  const url = new URL('https://github.com/GatheredApp/ForTwoPeople/issues/new')
  url.search = new URLSearchParams({ title: `Buffet submission: ${record.name} — ${record.city}, ${record.state}`, body: createPublicIssueBody(record) }).toString()
  return url.toString()
}
