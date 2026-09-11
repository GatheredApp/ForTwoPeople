interface SearchBarProps {
  query: string
  count: number
  onChange: (value: string) => void
}

export function SearchBar({ query, count, onChange }: SearchBarProps) {
  return (
    <section className="search-card" aria-label="Buffet search">
      <label htmlFor="buffet-search">Find your next feast</label>
      <div className="search-input-wrap">
        <span aria-hidden="true">⌕</span>
        <input
          id="buffet-search"
          type="search"
          value={query}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Name, city, address, or type"
          autoComplete="off"
        />
        {query && <button className="clear-button" type="button" onClick={() => onChange('')} aria-label="Clear search">×</button>}
      </div>
      <p aria-live="polite">{count} {count === 1 ? 'buffet' : 'buffets'} found</p>
    </section>
  )
}
