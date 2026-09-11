import type { Buffet } from '../types/Buffet'

export function filterBuffets(items: Buffet[], query: string): Buffet[] {
  const needle = query.trim().toLocaleLowerCase()
  if (!needle) return items
  return items.filter((buffet) =>
    [buffet.name, buffet.city, buffet.state, buffet.address, buffet.buffetType]
      .filter(Boolean)
      .some((value) => value!.toLocaleLowerCase().includes(needle)),
  )
}

export function buffetIdFromSearch(search: string): string | null {
  return new URLSearchParams(search).get('buffet')
}

export function searchWithBuffet(search: string, id?: string): string {
  const params = new URLSearchParams(search)
  if (id) params.set('buffet', id)
  else params.delete('buffet')
  const value = params.toString()
  return value ? `?${value}` : ''
}

export function directionsUrl(buffet: Buffet): string {
  const destination = [buffet.address, buffet.city, buffet.state, buffet.postalCode].filter(Boolean).join(', ')
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}
