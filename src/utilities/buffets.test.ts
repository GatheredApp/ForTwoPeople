import { describe, expect, it } from 'vitest'
import { buffets } from '../data/buffets'
import { buffetIdFromSearch, filterBuffets, searchWithBuffet } from './buffets'

describe('buffet utilities', () => {
  it('filters case-insensitively across supported fields', () => {
    expect(filterBuffets(buffets, 'TUC')).toHaveLength(1)
    expect(filterBuffets(buffets, 'barb')[0]?.id).toBe('red-rock-roundup-sedona-az')
  })
  it('reads and updates query-string deep links while preserving other parameters', () => {
    expect(buffetIdFromSearch('?buffet=desert-spoon-phoenix-az')).toBe('desert-spoon-phoenix-az')
    expect(searchWithBuffet('?source=test', 'abc')).toBe('?source=test&buffet=abc')
    expect(searchWithBuffet('?source=test&buffet=abc')).toBe('?source=test')
  })
})
