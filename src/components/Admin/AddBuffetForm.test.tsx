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
})
