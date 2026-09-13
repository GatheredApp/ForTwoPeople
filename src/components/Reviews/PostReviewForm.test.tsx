// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buffets } from '../../data/buffets'
import { emptyReviewDraft, REVIEW_DRAFT_KEY, snapshotFromBuffet } from '../../utilities/reviews'
import { PostReviewForm } from './PostReviewForm'

describe('PostReviewForm coordinate lookup', () => {
  beforeEach(() => { localStorage.clear(); history.replaceState({}, '', '/') })
  afterEach(() => { cleanup(); vi.unstubAllEnvs(); vi.unstubAllGlobals() })

  it('geocodes a genuinely new location while preserving manual editing', async () => {
    vi.stubEnv('VITE_MAPBOX_TOKEN', 'pk.test')
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ features: [{ geometry: { coordinates: [-86.158068, 39.768403] }, properties: { full_address: '10 Test Ave, Indianapolis, IN 46204' } }] })))
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup(); render(<PostReviewForm />)
    await user.type(screen.getByRole('textbox', { name: /street address/i }), '10 Test Ave')
    await user.type(screen.getByRole('textbox', { name: /^city/i }), 'Indianapolis')
    await user.selectOptions(screen.getByRole('combobox', { name: /state/i }), 'IN')
    await user.click(screen.getByRole('button', { name: 'Find Coordinates' }))
    expect(await screen.findByText('Location found.')).toBeTruthy()
    expect((screen.getByRole('spinbutton', { name: /latitude/i }) as HTMLInputElement).valueAsNumber).toBe(39.768403)
    expect((screen.getByRole('spinbutton', { name: /longitude/i }) as HTMLInputElement).valueAsNumber).toBe(-86.158068)
    await user.clear(screen.getByRole('spinbutton', { name: /longitude/i })); await user.type(screen.getByRole('spinbutton', { name: /longitude/i }), '-86.2')
    expect((screen.getByRole('spinbutton', { name: /longitude/i }) as HTMLInputElement).valueAsNumber).toBe(-86.2)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('uses an existing Mullet buffet canonical coordinates without Mapbox', () => {
    const buffet = buffets[0]
    localStorage.setItem(REVIEW_DRAFT_KEY, JSON.stringify({ ...emptyReviewDraft, buffetId: buffet.id, ...snapshotFromBuffet(buffet) }))
    const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock)
    render(<PostReviewForm />)
    expect(screen.getByText('Coordinates from existing Mullet Review buffet.')).toBeTruthy()
    expect((screen.getByRole('spinbutton', { name: /latitude/i }) as HTMLInputElement).valueAsNumber).toBe(buffet.latitude)
    expect((screen.getByRole('spinbutton', { name: /latitude/i }) as HTMLInputElement).readOnly).toBe(true)
    expect(screen.queryByRole('button', { name: /Find Coordinates/i })).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('does not break a new-location form when the token is absent', () => {
    vi.stubEnv('VITE_MAPBOX_TOKEN', '')
    render(<PostReviewForm />)
    expect(screen.getByText('Mapbox geocoding is not configured. Enter coordinates manually.')).toBeTruthy()
    expect((screen.getByRole('spinbutton', { name: /longitude/i }) as HTMLInputElement).readOnly).toBe(false)
  })
})
