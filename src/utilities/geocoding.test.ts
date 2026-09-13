import { afterEach, describe, expect, it, vi } from 'vitest'
import { geocodeAddress, GeocodingError } from './geocoding'

const input = { address: '1 Main St # 2', city: 'New York', state: 'NY', postalCode: '10001' }
const response = (coordinates: unknown = [-73.9876543, 40.7654321], extra = {}) => new Response(JSON.stringify({ features: [{ geometry: { coordinates }, properties: { full_address: '1 Main St, New York, NY 10001', ...extra } }] }), { status: 200 })

describe('geocodeAddress', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('constructs a minimal encoded US Mapbox request and maps GeoJSON order', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response())
    vi.stubGlobal('fetch', fetchMock)
    const result = await geocodeAddress(input, { token: 'pk.public-test' })
    const url = fetchMock.mock.calls[0][0] as URL
    expect(url.origin + url.pathname).toBe('https://api.mapbox.com/search/geocode/v6/forward')
    expect(url.searchParams.get('q')).toBe('1 Main St # 2, New York, NY, 10001')
    expect(url.searchParams.get('country')).toBe('us')
    expect(url.searchParams.get('types')).toBe('address')
    expect(url.searchParams.get('limit')).toBe('1')
    expect(url.searchParams.get('access_token')).toBe('pk.public-test')
    expect(url.toString()).toContain('1+Main+St+%23+2%2C+New+York%2C+NY%2C+10001')
    expect(result).toMatchObject({ latitude: 40.7654321, longitude: -73.9876543, formattedAddress: '1 Main St, New York, NY 10001' })
  })

  it.each([
    ['missing features', { features: [] }],
    ['malformed coordinates', { features: [{ geometry: { coordinates: [-80] } }] }],
    ['NaN coordinates', { features: [{ geometry: { coordinates: [-80, Number.NaN] } }] }],
    ['latitude outside range', { features: [{ geometry: { coordinates: [-80, 91] } }] }],
    ['longitude outside range', { features: [{ geometry: { coordinates: [-181, 40] } }] }],
  ])('rejects %s', async (_name, body) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(body))))
    await expect(geocodeAddress(input, { token: 'pk.test' })).rejects.toMatchObject({ code: 'no-result' })
  })

  it('handles HTTP and rate-limit failures without including the token', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 403 })))
    const error = await geocodeAddress(input, { token: 'token-must-not-leak' }).catch((value) => value) as GeocodingError
    expect(error.code).toBe('unavailable')
    expect(error.message).not.toContain('token-must-not-leak')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 429 })))
    await expect(geocodeAddress(input, { token: 'pk.test' })).rejects.toMatchObject({ code: 'rate-limited' })
  })

  it('preserves AbortError and converts other network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError')))
    await expect(geocodeAddress(input, { token: 'pk.test' })).rejects.toMatchObject({ name: 'AbortError' })
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
    await expect(geocodeAddress(input, { token: 'pk.test' })).rejects.toMatchObject({ code: 'unavailable' })
  })

  it('fails safely when no token is configured without making a request', async () => {
    const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock)
    await expect(geocodeAddress(input, { token: '' })).rejects.toMatchObject({ code: 'not-configured' })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
