import { describe, expect, it } from 'vitest'
import type { Buffet } from '../types/Buffet'
import { buffetIdFromSearch, filterBuffets, searchWithBuffet } from './buffets'

const fixtures: Buffet[] = [
  {
    id: 'example-buffet-tucson-az',
    name: 'Example Buffet',
    address: '123 Main St',
    city: 'Tucson',
    state: 'AZ',
    latitude: 32.22,
    longitude: -110.97,
    buffetType: 'Barbecue',
  },
]

describe('buffet utilities', () => {
  it('filters case-insensitively across supported fields', () => {
    expect(filterBuffets(fixtures, 'TUC')).toHaveLength(1)
    expect(filterBuffets(fixtures, 'barb')[0]?.id).toBe('example-buffet-tucson-az')
  })
  it('reads and updates query-string deep links while preserving other parameters', () => {
    expect(buffetIdFromSearch('?buffet=example-buffet-tucson-az')).toBe('example-buffet-tucson-az')
    expect(searchWithBuffet('?source=test', 'abc')).toBe('?source=test&buffet=abc')
    expect(searchWithBuffet('?source=test&buffet=abc')).toBe('?source=test')
  })
})
