// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AddBuffetForm } from './AddBuffetForm'

describe('AddBuffetForm', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => { cleanup(); vi.unstubAllEnvs(); vi.unstubAllGlobals() })

  it('retains the complete buffet name and focus while typing', async () => {
    const user = userEvent.setup()
    render(<AddBuffetForm />)
    const nameInput = screen.getByRole('textbox', { name: /buffet name/i }) as HTMLInputElement

    nameInput.focus()
    await user.keyboard('Golden Corral')

    expect(nameInput.value).toBe('Golden Corral')
    expect(document.activeElement).toBe(nameInput)
  })

  it('presents a public form without the owner Rangoon rating and uses a separate draft', async () => {
    const user = userEvent.setup()
    render(<AddBuffetForm mode="public" />)
    expect(screen.getByRole('heading', { name: 'Suggest a Buffet' })).toBeTruthy()
    expect(screen.queryByLabelText(/Rangoon Rating/i)).toBeNull()
    await user.type(screen.getByRole('textbox', { name: /buffet name/i }), 'Public Draft')
    expect(JSON.parse(localStorage.getItem('fortwopeople-public-buffet-draft-v1') ?? '{}').name).toBe('Public Draft')
    expect(localStorage.getItem('fortwopeople-buffet-draft-v1')).toBeNull()
  })

  it.each([['admin' as const], ['public' as const]])('finds coordinates in %s mode and marks them stale after an address change', async (mode) => {
    vi.stubEnv('VITE_MAPBOX_TOKEN', 'pk.test')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ features: [{ geometry: { coordinates: [-111.6342154, 33.2487414] }, properties: { full_address: '123 Main St, Town, AZ 85140' } }] }))))
    const user = userEvent.setup(); render(<AddBuffetForm mode={mode} />)
    const button = screen.getByRole('button', { name: 'Find Coordinates' })
    expect((button as HTMLButtonElement).disabled).toBe(true)
    await user.type(screen.getByRole('textbox', { name: /street address/i }), '123 Main St')
    await user.type(screen.getByRole('textbox', { name: /^city/i }), 'Town')
    await user.selectOptions(screen.getByRole('combobox', { name: /state/i }), 'AZ')
    expect((button as HTMLButtonElement).disabled).toBe(false); await user.click(button)
    expect(await screen.findByText('Location found.')).toBeTruthy()
    expect((screen.getByRole('spinbutton', { name: /latitude/i }) as HTMLInputElement).valueAsNumber).toBe(33.248741)
    expect((screen.getByRole('spinbutton', { name: /longitude/i }) as HTMLInputElement).valueAsNumber).toBe(-111.634215)
    expect(screen.getByText('123 Main St, Town, AZ 85140')).toBeTruthy()
    await user.type(screen.getByRole('textbox', { name: /street address/i }), ' changed')
    expect(screen.getByText(/Address changed since coordinates were found/)).toBeTruthy()
    await user.clear(screen.getByRole('spinbutton', { name: /latitude/i })); await user.type(screen.getByRole('spinbutton', { name: /latitude/i }), '33.2')
    expect(screen.queryByText(/Address changed since coordinates were found/)).toBeNull()
  })

  it('keeps manual coordinates available when Mapbox is not configured', () => {
    vi.stubEnv('VITE_MAPBOX_TOKEN', '')
    render(<AddBuffetForm />)
    expect(screen.getByText('Mapbox geocoding is not configured. Enter coordinates manually.')).toBeTruthy()
    expect((screen.getByRole('spinbutton', { name: /latitude/i }) as HTMLInputElement).readOnly).toBe(false)
  })
})
