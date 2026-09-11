import { describe, expect, it } from 'vitest'
import type { Buffet } from '../../types/Buffet'
import { filterBuffets } from '../../utilities/buffets'
import { groupBuffetsByState } from '../../utilities/groupBuffets'

const buffet = (name: string, city: string, state: string): Buffet => ({
  id: `${name}-${city}`,
  name,
  city,
  state,
  address: '1 Main St',
  latitude: 1,
  longitude: 1,
})

describe('groupBuffetsByState', () => {
  const fixtures = [
    buffet('Zen Buffet', 'North Vernon', 'IN'),
    buffet('Alpha Buffet', 'Greensburg', 'IN'),
    buffet('River Buffet', 'Louisville', 'KY'),
  ]

  it('groups and alphabetizes states by their full names', () => {
    const groups = groupBuffetsByState(fixtures)
    expect(groups.map(({ stateName }) => stateName)).toEqual(['Indiana', 'Kentucky'])
    expect(groups[0].buffets).toHaveLength(2)
  })

  it('alphabetizes locations by city and then name', () => {
    const sameCity = buffet('A Buffet', 'North Vernon', 'IN')
    const groups = groupBuffetsByState([...fixtures, sameCity])
    expect(groups[0].buffets.map(({ name }) => name)).toEqual(['Alpha Buffet', 'A Buffet', 'Zen Buffet'])
  })

  it('returns no groups for empty input', () => {
    expect(groupBuffetsByState([])).toEqual([])
  })

  it('groups an already-filtered collection without restoring excluded locations', () => {
    const groups = groupBuffetsByState(filterBuffets(fixtures, 'Louisville'))
    expect(groups).toHaveLength(1)
    expect(groups[0].stateName).toBe('Kentucky')
    expect(groups[0].buffets).toHaveLength(1)
  })
})
