import type { CommunityReview } from '../../types/CommunityReview'
import { VideoPlayer } from '../VideoPlayer/VideoPlayer'
import { GoonRating } from './GoonRating'

export function ReviewItem({ item, compact = false }: { item: CommunityReview; compact?: boolean }) {
  return <article className="community-review"><div className="review-byline"><strong>{item.displayName}</strong><a href={`https://github.com/${encodeURIComponent(item.githubUser)}`} target="_blank" rel="noreferrer">@{item.githubUser}</a></div><GoonRating rating={item.rating} /><p>{item.review}</p>{item.youtubeVideoId && (compact ? <a href={item.youtubeUrl ?? `https://www.youtube.com/watch?v=${item.youtubeVideoId}`} target="_blank" rel="noreferrer">▶ Watch on YouTube ↗</a> : <div className="community-review-video"><VideoPlayer videoId={item.youtubeVideoId} title={`Community review by ${item.displayName}`} playSignal={0} />{item.youtubeUrl && <a href={item.youtubeUrl} target="_blank" rel="noreferrer">Open on YouTube ↗</a>}</div>)}{!compact && <dl>{item.visitDate && <><dt>Visited</dt><dd>{item.visitDate}</dd></>}{item.wouldReturn && <><dt>Would return?</dt><dd>{item.wouldReturn === 'unsure' ? 'Unsure / prefer not to say' : item.wouldReturn[0].toUpperCase() + item.wouldReturn.slice(1)}</dd></>}</dl>}</article>
}
