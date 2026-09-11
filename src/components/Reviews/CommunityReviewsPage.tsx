import { useMemo, useState } from 'react'
import { reviews } from '../../data/reviews'
import { ReviewItem } from './ReviewItem'

export function CommunityReviewsPage() {
  const buffetId = new URLSearchParams(location.search).get('buffet')
  const [query, setQuery] = useState('')
  const shown = useMemo(() => reviews.filter((r) => (!buffetId || r.buffetId === buffetId) && [r.buffet.name,r.buffet.city,r.buffet.state,r.displayName,r.githubUser,r.review].join(' ').toLowerCase().includes(query.trim().toLowerCase())), [buffetId, query])
  return <main className="reviews-page"><header className="admin-header"><div><p>For Two People Presents</p><h1>Community Reviews</h1></div><nav><a href={location.pathname}>← Back to Map</a><a className="review-cta" href="?review=1">Post Your Review</a></nav></header><section className="reviews-content">{buffetId && <p className="filter-note">Showing reviews linked to one map buffet. <a href="?reviews=1">View all community reviews</a></p>}<label className="reviews-search"><span>Search reviews</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buffet, city, reviewer, or review text" /></label><div className="reviews-grid">{shown.map((item) => <div key={item.id} className="review-result"><h2>{item.buffetId ? <a href={`?buffet=${encodeURIComponent(item.buffetId)}`}>{item.buffet.name}</a> : item.buffet.name}</h2><p>{item.buffet.city}, {item.buffet.state}{item.buffet.address && <> · {item.buffet.address}</>}</p>{!item.buffetId && <span className="unlinked-label">Not currently on the map</span>}<ReviewItem item={item} /></div>)}</div>{!shown.length && <div className="reviews-empty"><h2>No community reviews found.</h2><p>Be the first to share a buffet experience.</p><a href="?review=1">Post Your Review</a></div>}</section></main>
}
