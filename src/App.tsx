import { useCallback, useEffect, useMemo, useState } from 'react'
import { BuffetCard } from './components/BuffetCard/BuffetCard'
import { BuffetMap } from './components/Map/BuffetMap'
import { SearchBar } from './components/SearchBar/SearchBar'
import { buffets } from './data/buffets'
import type { Buffet } from './types/Buffet'
import { buffetIdFromSearch, filterBuffets, searchWithBuffet } from './utilities/buffets'

export default function App() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Buffet | null>(() => {
    const id = buffetIdFromSearch(window.location.search)
    return buffets.find((item) => item.id === id) ?? null
  })
  const matches = useMemo(() => filterBuffets(buffets, query), [query])

  const updateSelection = useCallback((buffet: Buffet | null, replace = false) => {
    setSelected(buffet)
    const next = `${window.location.pathname}${searchWithBuffet(window.location.search, buffet?.id)}${window.location.hash}`
    window.history[replace ? 'replaceState' : 'pushState']({}, '', next)
  }, [])

  useEffect(() => {
    const requestedId = buffetIdFromSearch(window.location.search)
    if (requestedId && !buffets.some((item) => item.id === requestedId)) updateSelection(null, true)
    const handlePopState = () => {
      const id = buffetIdFromSearch(window.location.search)
      setSelected(buffets.find((item) => item.id === id) ?? null)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [updateSelection])

  useEffect(() => {
    if (selected && query && !matches.some((item) => item.id === selected.id)) updateSelection(null, true)
  }, [matches, query, selected, updateSelection])

  return (
    <main className="app-shell">
      <header className="brand-bar">
        <div className="brand-mark" aria-hidden="true">MR</div>
        <div><p>Fan-made food finds</p><h1>Mullet Review <span>Buffet Map</span></h1></div>
        <span className="location-badge">{buffets.length} {buffets.length === 1 ? 'location' : 'locations'}</span>
      </header>
      <section className="map-stage" aria-label="Buffet discovery map">
        <BuffetMap buffets={matches} selected={selected} onSelect={(buffet) => updateSelection(buffet)} />
        <SearchBar query={query} count={matches.length} onChange={setQuery} />
        {matches.length === 0 && (
          <div className="empty-state" role="status"><strong>No buffets on this route.</strong><span>Try another name, city, or buffet type.</span><button onClick={() => setQuery('')}>Clear search</button></div>
        )}
        {selected && <BuffetCard buffet={selected} onClose={() => updateSelection(null)} />}
      </section>
    </main>
  )
}
