export type GeocodeAddressInput = {
  address: string
  city: string
  state: string
  postalCode?: string
}

export type GeocodeResult = {
  latitude: number
  longitude: number
  formattedAddress?: string
  placeName?: string
}

export class GeocodingError extends Error {
  constructor(public readonly code: 'not-configured' | 'no-result' | 'rate-limited' | 'unavailable') {
    super(code)
    this.name = 'GeocodingError'
  }
}

export const getMapboxToken = () => import.meta.env.VITE_MAPBOX_TOKEN?.trim() ?? ''

export async function geocodeAddress(input: GeocodeAddressInput, options: { signal?: AbortSignal; token?: string } = {}): Promise<GeocodeResult> {
  const token = options.token ?? getMapboxToken()
  if (!token) throw new GeocodingError('not-configured')

  const url = new URL('https://api.mapbox.com/search/geocode/v6/forward')
  url.searchParams.set('q', [input.address, input.city, input.state, input.postalCode].map((value) => value?.trim()).filter(Boolean).join(', '))
  url.searchParams.set('country', 'us')
  url.searchParams.set('types', 'address')
  url.searchParams.set('limit', '1')
  url.searchParams.set('access_token', token)

  let response: Response
  try {
    response = await fetch(url, { signal: options.signal })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new GeocodingError('unavailable')
  }
  if (response.status === 429) throw new GeocodingError('rate-limited')
  if (!response.ok) throw new GeocodingError('unavailable')

  let body: unknown
  try { body = await response.json() } catch { throw new GeocodingError('unavailable') }
  const feature = (body as { features?: unknown[] })?.features?.[0] as {
    geometry?: { coordinates?: unknown[] }
    properties?: { full_address?: unknown; name?: unknown; match_code?: { confidence?: unknown } }
    place_name?: unknown
    relevance?: unknown
  } | undefined
  const coordinates = feature?.geometry?.coordinates
  const longitude = coordinates?.[0]
  const latitude = coordinates?.[1]
  const confidence = feature?.properties?.match_code?.confidence
  const relevance = feature?.relevance
  const poorMatch = confidence === 'low' || (typeof relevance === 'number' && relevance < 0.5)
  if (!feature || poorMatch || coordinates?.length !== 2 || typeof latitude !== 'number' || typeof longitude !== 'number' ||
    !Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new GeocodingError('no-result')
  }
  const formattedAddress = typeof feature.properties?.full_address === 'string' ? feature.properties.full_address
    : typeof feature.place_name === 'string' ? feature.place_name : undefined
  return {
    latitude,
    longitude,
    ...(formattedAddress ? { formattedAddress } : {}),
    ...(typeof feature.properties?.name === 'string' ? { placeName: feature.properties.name } : {}),
  }
}
