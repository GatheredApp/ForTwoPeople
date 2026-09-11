import { useCallback, useEffect, useMemo, useState } from 'react'
import { BuffetCard } from './components/BuffetCard/BuffetCard'
import { AddBuffetForm } from './components/Admin/AddBuffetForm'
import { BuffetList } from './components/BuffetList/BuffetList'
import { BuffetMap } from './components/Map/BuffetMap'
import { SearchBar } from './components/SearchBar/SearchBar'
import { InstallPrompt } from './components/InstallPrompt/InstallPrompt'
import { PostReviewForm } from './components/Reviews/PostReviewForm'
import { CommunityReviewsPage } from './components/Reviews/CommunityReviewsPage'
import goonImage from './assets/goon.png'
import { buffets } from './data/buffets'
import type { Buffet } from './types/Buffet'
import { buffetIdFromSearch, filterBuffets, searchWithBuffet } from './utilities/buffets'

export default function App() {
  const params = new URLSearchParams(window.location.search)
  if (params.get('admin') === '1') return <AddBuffetForm mode="admin" />
  if (params.get('submit') === '1') return <AddBuffetForm mode="public" />
  if (params.get('review') === '1') return <PostReviewForm />
  if (params.get('reviews') === '1') return <CommunityReviewsPage />
  return <MapApp />
}

function MapApp() {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
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
        <div className="brand-mark" aria-hidden="true"><img src={goonImage} alt="" /></div>
        <div className="brand-copy"><p>For Two People Presents</p><h1>Mullet Review <span>Buffet Map</span></h1></div>
        <nav className="public-actions"><a className="review-cta" href="?review=1">Post Your Review</a><a href="?submit=1">Suggest a Buffet</a><a href="?reviews=1">Community Reviews</a></nav>
        <div className="view-toggle" role="group" aria-label="Choose buffet view">
          <button type="button" aria-pressed={viewMode === 'map'} onClick={() => setViewMode('map')}>Map</button>
          <button type="button" aria-pressed={viewMode === 'list'} onClick={() => setViewMode('list')}>List</button>
        </div>
      </header>
      <section className={`map-stage ${viewMode}-view`} aria-label="Buffet discovery">
        {viewMode === 'map' ? (
          <BuffetMap buffets={matches} selected={selected} onSelect={(buffet) => updateSelection(buffet)} />
        ) : (
          <BuffetList buffets={matches} selected={selected} onSelect={(buffet) => updateSelection(buffet)} />
        )}
        <SearchBar query={query} count={matches.length} onChange={setQuery} />
        {matches.length === 0 && (
          <div className="empty-state" role="status"><strong>No buffets on this route.</strong><span>Try another name, city, or buffet type.</span><button onClick={() => setQuery('')}>Clear search</button></div>
        )}
        {selected && <BuffetCard buffet={selected} onClose={() => updateSelection(null)} />}
        <InstallPrompt hidden={selected !== null} />
      </section>
    </main>
  )
}
