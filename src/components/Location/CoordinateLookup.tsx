import { useEffect, useRef, useState } from 'react'
import { geocodeAddress, GeocodingError, getMapboxToken } from '../../utilities/geocoding'

type Props = {
  address: string
  city: string
  state: string
  postalCode: string
  latitude: string | number
  longitude: string | number
  onLatitudeChange: (value: string) => void
  onLongitudeChange: (value: string) => void
  onCoordinatesFound: (latitude: number, longitude: number) => void
  onStaleChange?: (stale: boolean) => void
  canonical?: boolean
  canonicalLabel?: string
  latitudeError?: string
  longitudeError?: string
  showValidation?: boolean
}

const fingerprint = (values: Pick<Props, 'address' | 'city' | 'state' | 'postalCode'>) =>
  [values.address, values.city, values.state, values.postalCode].map((value) => value.trim().toLowerCase()).join('|')
const rounded = (value: number) => Number(value.toFixed(6))

export function CoordinateLookup(props: Props) {
  const currentFingerprint = fingerprint(props)
  const [resolvedFingerprint, setResolvedFingerprint] = useState<string>()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [matchedAddress, setMatchedAddress] = useState('')
  const controller = useRef<AbortController | undefined>(undefined)
  const request = useRef(0)
  const stale = Boolean(resolvedFingerprint && resolvedFingerprint !== currentFingerprint)
  const configured = Boolean(getMapboxToken())
  const adequateAddress = Boolean(props.address.trim() && props.city.trim() && props.state.trim())

  const onStaleChange = props.onStaleChange
  useEffect(() => { onStaleChange?.(stale) }, [stale, onStaleChange])
  useEffect(() => () => controller.current?.abort(), [])

  const lookup = async () => {
    controller.current?.abort()
    const active = ++request.current
    controller.current = new AbortController()
    setStatus('loading'); setMessage('Finding coordinates…'); setMatchedAddress('')
    try {
      const result = await geocodeAddress(props, { signal: controller.current.signal })
      if (active !== request.current) return
      const latitude = rounded(result.latitude); const longitude = rounded(result.longitude)
      props.onCoordinatesFound(latitude, longitude)
      setResolvedFingerprint(currentFingerprint); setMatchedAddress(result.formattedAddress ?? result.placeName ?? '')
      setStatus('success'); setMessage('Location found.')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      if (active !== request.current) return
      setStatus('error')
      setMessage(error instanceof GeocodingError && error.code === 'not-configured'
        ? 'Mapbox geocoding is not configured. Enter coordinates manually or configure VITE_MAPBOX_TOKEN.'
        : error instanceof GeocodingError && error.code === 'no-result'
          ? "We couldn't confidently locate this address. Check the address or enter coordinates manually."
          : error instanceof GeocodingError && error.code === 'rate-limited'
            ? 'Address lookup is temporarily unavailable. Try again shortly or enter coordinates manually.'
            : 'Unable to look up this address right now. You can still enter coordinates manually.')
    }
  }
  const manual = (which: 'latitude' | 'longitude', value: string) => {
    setResolvedFingerprint(undefined); setMatchedAddress(''); setStatus('idle'); setMessage('Coordinates entered manually.')
    props.onStaleChange?.(false)
    if (which === 'latitude') props.onLatitudeChange(value); else props.onLongitudeChange(value)
  }

  return <>
    {!props.canonical && <div className="coordinate-lookup admin-wide">
      <button type="button" onClick={lookup} disabled={!adequateAddress || status === 'loading' || !configured}>
        {status === 'loading' ? 'Finding…' : resolvedFingerprint ? 'Refresh Coordinates' : 'Find Coordinates'}
      </button>
      <div className="coordinate-status" role="status" aria-live="polite">
        {!configured ? 'Mapbox geocoding is not configured. Enter coordinates manually.' : stale ? '⚠ Address changed since coordinates were found. Refresh coordinates or enter them manually.' : message}
        {!stale && matchedAddress && <small>{matchedAddress}</small>}
      </div>
    </div>}
    {props.canonical && <div className="coordinate-status admin-wide" role="status"><strong>Canonical location</strong><small>{props.canonicalLabel ?? 'Coordinates from existing map record.'}</small></div>}
    <label className="admin-field"><span>Latitude <b aria-hidden="true"> *</b></span><input type="number" required value={props.latitude} readOnly={props.canonical} onChange={(event) => manual('latitude', event.target.value)} aria-invalid={props.showValidation && Boolean(props.latitudeError)} /><small>Decimal coordinate from -90 to 90.</small>{props.showValidation && props.latitudeError && <em role="alert">{props.latitudeError}</em>}</label>
    <label className="admin-field"><span>Longitude <b aria-hidden="true"> *</b></span><input type="number" required value={props.longitude} readOnly={props.canonical} onChange={(event) => manual('longitude', event.target.value)} aria-invalid={props.showValidation && Boolean(props.longitudeError)} /><small>Decimal coordinate from -180 to 180.</small>{props.showValidation && props.longitudeError && <em role="alert">{props.longitudeError}</em>}</label>
  </>
}
