export const US_STATES = new Set(['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'])
const REQUIRED = ['id', 'name', 'address', 'city', 'state', 'latitude', 'longitude', 'youtubeVideoId', 'youtubeUrl']
const ALLOWED = new Set([...REQUIRED, 'postalCode', 'reviewDate', 'yelpUrl', 'yelpRating', 'yelpReviewCount', 'reviewerRating', 'rangoonRating', 'buffetType', 'price', 'isOpen', 'notes'])
const PUBLIC_ALLOWED = new Set([...REQUIRED, 'postalCode', 'reviewDate', 'yelpUrl', 'reviewerRating', 'buffetType', 'price', 'isOpen', 'notes'])
const STRING_FIELDS = ['id', 'name', 'address', 'city', 'state', 'youtubeVideoId', 'youtubeUrl', 'postalCode', 'reviewDate', 'yelpUrl', 'buffetType', 'price', 'notes']

function isYelpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && (url.hostname === 'yelp.com' || url.hostname.endsWith('.yelp.com'))
  } catch { return false }
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}

export function validateBuffet(record, label = 'Buffet') {
  const errors = []
  if (!record || typeof record !== 'object' || Array.isArray(record)) return [`${label} must be a JSON object.`]
  for (const key of Object.keys(record)) if (!ALLOWED.has(key)) errors.push(`${label} contains unsupported property: ${key}.`)
  for (const key of REQUIRED) if (!(key in record)) errors.push(`${label} is missing required property: ${key}.`)
  for (const key of STRING_FIELDS) if (key in record && (typeof record[key] !== 'string' || !record[key].trim())) errors.push(`${label}.${key} must be a non-empty string.`)
  if (typeof record.id === 'string' && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.id)) errors.push('ID must be lowercase kebab case.')
  if (typeof record.state === 'string' && !US_STATES.has(record.state)) errors.push('State must be a valid two-character U.S. abbreviation.')
  if (typeof record.latitude !== 'number' || !Number.isFinite(record.latitude) || record.latitude < -90 || record.latitude > 90) errors.push('Latitude must be between -90 and 90.')
  if (typeof record.longitude !== 'number' || !Number.isFinite(record.longitude) || record.longitude < -180 || record.longitude > 180) errors.push('Longitude must be between -180 and 180.')
  if (typeof record.youtubeVideoId === 'string' && !/^[A-Za-z0-9_-]{11}$/.test(record.youtubeVideoId)) errors.push('YouTube video ID must be 11 valid characters.')
  if (typeof record.youtubeVideoId === 'string' && record.youtubeUrl !== `https://www.youtube.com/watch?v=${record.youtubeVideoId}`) errors.push('YouTube URL must be the normalized URL for youtubeVideoId.')
  if ('yelpUrl' in record && (typeof record.yelpUrl !== 'string' || !isYelpUrl(record.yelpUrl))) errors.push('Yelp URL must be a valid HTTPS Yelp URL.')
  if ('reviewDate' in record && (typeof record.reviewDate !== 'string' || !isValidDate(record.reviewDate))) errors.push('Review date must be a real YYYY-MM-DD date.')
  if ('rangoonRating' in record && (!Number.isInteger(record.rangoonRating) || record.rangoonRating < 1 || record.rangoonRating > 5)) errors.push('Rangoon rating must be an integer from 1 to 5.')
  for (const key of ['yelpRating', 'yelpReviewCount', 'reviewerRating']) if (key in record && (typeof record[key] !== 'number' || !Number.isFinite(record[key]))) errors.push(`${key} must be a finite number.`)
  if ('isOpen' in record && typeof record.isOpen !== 'boolean') errors.push('isOpen must be a boolean.')
  return errors
}

export function validatePublicBuffet(record, label = 'Public submission') {
  const errors = validateBuffet(record, label)
  if (record && typeof record === 'object' && !Array.isArray(record)) {
    for (const key of Object.keys(record)) if (!PUBLIC_ALLOWED.has(key)) errors.push(key === 'rangoonRating' ? 'Public submissions cannot set rangoonRating.' : `${label} contains unsupported public property: ${key}.`)
  }
  return [...new Set(errors)]
}

const normalized = (value) => value.trim().toLowerCase().replace(/\s+/g, ' ')
export function findDuplicateErrors(records, candidate, candidateIndex) {
  const errors = []
  records.forEach((record, index) => {
    if (index === candidateIndex) return
    if (record.id === candidate.id) errors.push(`Duplicate buffet ID: ${candidate.id}`)
    if (record.youtubeVideoId === candidate.youtubeVideoId) errors.push(`Duplicate YouTube video ID: ${candidate.youtubeVideoId}`)
    if (typeof record.name === 'string' && typeof record.address === 'string' && normalized(record.name) === normalized(candidate.name) && normalized(record.address) === normalized(candidate.address)) errors.push(`Duplicate normalized name/address: ${candidate.name}, ${candidate.address}`)
    if (record.latitude === candidate.latitude && record.longitude === candidate.longitude) errors.push(`Duplicate coordinates: ${candidate.latitude}, ${candidate.longitude}`)
  })
  return [...new Set(errors)]
}

export function validateDataset(records) {
  if (!Array.isArray(records)) return ['Dataset must be a JSON array.']
  const errors = records.flatMap((record, index) => validateBuffet(record, `Buffet at index ${index}`))
  records.forEach((record, index) => errors.push(...findDuplicateErrors(records, record, index).map((error) => `Buffet at index ${index}: ${error}`)))
  return [...new Set(errors)]
}

export function extractSubmission(body) {
  if (typeof body !== 'string') throw new Error('Issue body is missing.')
  const match = body.match(/<!-- BUFFET_SUBMISSION_V1\s*\n([\s\S]*?)\nBUFFET_SUBMISSION_END -->/)
  if (!match) throw new Error('Buffet submission markers are missing or malformed.')
  try { return JSON.parse(match[1]) } catch { throw new Error('Buffet submission contains invalid JSON.') }
}


export function extractPublicSubmission(body) {
  if (typeof body !== 'string') throw new Error('Issue body is missing.')
  if (body.length > 100_000) throw new Error('Public submission payload is too large.')
  const pattern = /<!-- BUFFET_PUBLIC_SUBMISSION_V1\s*\n([\s\S]*?)\nBUFFET_PUBLIC_SUBMISSION_END -->/g
  const matches = [...body.matchAll(pattern)]
  if (matches.length !== 1) throw new Error(matches.length ? 'Multiple public submission payloads are not allowed.' : 'Public buffet submission markers are missing or malformed.')
  if (matches[0][1].length > 20_000) throw new Error('Public submission JSON is too large.')
  try {
    const parsed = JSON.parse(matches[0][1])
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Public submission must be a JSON object.')
    return parsed
  } catch (error) {
    if (error instanceof Error && error.message === 'Public submission must be a JSON object.') throw error
    throw new Error('Public submission contains invalid JSON.')
  }
}
