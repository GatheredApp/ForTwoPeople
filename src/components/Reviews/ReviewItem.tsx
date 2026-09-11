import type { CommunityReview } from '../../types/CommunityReview'
import { GoonRating } from './GoonRating'

export function ReviewItem({ item, compact = false }: { item: CommunityReview; compact?: boolean }) {
  return <article className="community-review"><div className="review-byline"><strong>{item.displayName}</strong><a href={`https://github.com/${encodeURIComponent(item.githubUser)}`} target="_blank" rel="noreferrer">@{item.githubUser}</a></div><GoonRating rating={item.rating} /><p>{item.review}</p>{!compact && <dl>{item.visitDate && <><dt>Visited</dt><dd>{item.visitDate}</dd></>}{item.wouldReturn && <><dt>Would return?</dt><dd>{item.wouldReturn === 'unsure' ? 'Unsure / prefer not to say' : item.wouldReturn[0].toUpperCase() + item.wouldReturn.slice(1)}</dd></>}</dl>}</article>
}
