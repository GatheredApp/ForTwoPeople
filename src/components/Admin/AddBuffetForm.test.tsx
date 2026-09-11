// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AddBuffetForm } from './AddBuffetForm'

describe('AddBuffetForm', () => {
  beforeEach(() => localStorage.clear())
  afterEach(cleanup)

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
})
