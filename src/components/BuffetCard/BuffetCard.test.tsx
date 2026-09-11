// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import buffetData from '../../data/buffets.json'
import type { Buffet } from '../../types/Buffet'
import { BuffetCard } from './BuffetCard'

const buffet: Buffet = {
  id: 'test-buffet',
  name: 'Test Buffet',
  address: '1 Main St',
  city: 'Indianapolis',
  state: 'IN',
  latitude: 39.7684,
  longitude: -86.1581,
  reviewerRating: 2.2,
  rangoonRating: 2,
}

describe('BuffetCard', () => {
  afterEach(cleanup)

  it('shows the owner Rangoon rating separately from the reviewer score and community reviews', () => {
    render(<BuffetCard buffet={buffet} onClose={() => undefined} />)

    const ownerRating = screen.getByRole('img', { name: 'For Two People Rangoon Rating: 2 out of 5' })
    expect(screen.getByText('For Two People Rangoon Rating')).toBeTruthy()
    expect(within(ownerRating).getAllByRole('presentation')).toHaveLength(5)
    expect(screen.getByText('2.2')).toBeTruthy()
    expect(screen.getByText('Reviewer score')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Community Reviews' })).toBeTruthy()
    expect(screen.getByText('No community reviews yet.')).toBeTruthy()
  })

  it('exposes a five-out-of-five owner Rangoon rating', () => {
    render(<BuffetCard buffet={{ ...buffet, rangoonRating: 5 }} onClose={() => undefined} />)

    expect(screen.getByRole('img', { name: 'For Two People Rangoon Rating: 5 out of 5' })).toBeTruthy()
  })

  it('shows Fu Yuan Hibachi Buffet\'s stored two-out-of-five rating', () => {
    const fuYuan = (buffetData as Buffet[]).find(({ name }) => name === 'Fu Yuan Hibachi Buffet')
    expect(fuYuan).toBeTruthy()
    render(<BuffetCard buffet={fuYuan!} onClose={() => undefined} />)

    expect(screen.getByRole('img', { name: 'For Two People Rangoon Rating: 2 out of 5' })).toBeTruthy()
  })

  it('omits the owner rating section when the buffet has no Rangoon rating', () => {
    render(<BuffetCard buffet={{ ...buffet, rangoonRating: undefined }} onClose={() => undefined} />)

    expect(screen.queryByText('For Two People Rangoon Rating')).toBeNull()
    expect(screen.queryByRole('img', { name: /For Two People Rangoon Rating/ })).toBeNull()
  })
})
