import { useState } from 'react'
import type { Buffet } from '../../types/Buffet'
import { directionsUrl } from '../../utilities/buffets'
import { VideoPlayer } from '../VideoPlayer/VideoPlayer'
import { reviews } from '../../data/reviews'
import { averageRating, reviewsForBuffet } from '../../utilities/reviews'
import { ReviewItem } from '../Reviews/ReviewItem'
import { GoonRating } from '../Reviews/GoonRating'

interface BuffetCardProps { buffet: Buffet; onClose: () => void }

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(date)
}

export function BuffetCard({ buffet, onClose }: BuffetCardProps) {
  const [playSignal, setPlaySignal] = useState(0)
  const locality = [buffet.city, buffet.state, buffet.postalCode].filter(Boolean).join(', ').replace(', ', ', ')
  const communityReviews = reviewsForBuffet(reviews, buffet.id).sort((a,b) => b.submittedAt.localeCompare(a.submittedAt))
  return (
    <aside className="buffet-card" aria-label={`${buffet.name} details`}>
      <div className="sheet-handle" aria-hidden="true" />
      <button className="close-button" onClick={onClose} type="button" aria-label="Close buffet details">×</button>
      <div className="eyebrow">{buffet.isOpen === false ? 'Reported closed · ' : ''}{buffet.buffetType ?? 'Buffet'} {buffet.price && `· ${buffet.price}`}</div>
      <h2>{buffet.name}</h2>
      <address>{buffet.address}<br />{locality}</address>
      <div className="rating-row">
        {buffet.reviewerRating != null && <div className="score"><strong>{buffet.reviewerRating.toFixed(1)}</strong><span>Reviewer score</span></div>}
        {buffet.reviewDate && <div className="review-date"><span>Reviewed</span><strong>{formatDate(buffet.reviewDate)}</strong></div>}
      </div>
      {buffet.rangoonRating != null && <div className="owner-rangoon-rating"><span>For Two People Goon Rating</span><GoonRating rating={buffet.rangoonRating} label="For Two People Rangoon Rating" /></div>}
      {buffet.notes && <p className="notes">{buffet.notes}</p>}
      <section className="card-community"><h3>Community Reviews</h3>{communityReviews.length ? <><p className="community-average"><strong>{averageRating(communityReviews).toFixed(1)} / 5</strong> · {communityReviews.length} {communityReviews.length === 1 ? 'review' : 'reviews'}</p>{communityReviews.slice(0,3).map((item) => <ReviewItem key={item.id} item={item} compact />)}{communityReviews.length > 3 && <a href={`?reviews=1&buffet=${encodeURIComponent(buffet.id)}`}>View all community reviews</a>}</> : <p>No community reviews yet.</p>}<a className="post-review-card" href={`?review=1&buffet=${encodeURIComponent(buffet.id)}`}>Post Your Review</a></section>
      <VideoPlayer key={buffet.id} videoId={buffet.youtubeVideoId} title={buffet.name} playSignal={playSignal} />
      <div className="actions">
        {buffet.youtubeVideoId && <button className="primary-action" type="button" onClick={() => setPlaySignal((value) => value + 1)}>▶ Watch Review</button>}
        {buffet.youtubeUrl && <a href={buffet.youtubeUrl} target="_blank" rel="noreferrer">Open on YouTube ↗</a>}
        {buffet.yelpUrl && <a href={buffet.yelpUrl} target="_blank" rel="noreferrer">View on Yelp ↗</a>}
        <a href={directionsUrl(buffet)} target="_blank" rel="noreferrer">Get Directions ↗</a>
      </div>
    </aside>
  )
}
