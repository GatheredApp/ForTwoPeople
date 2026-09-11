import goonImage from '../../assets/goon.png'

export function GoonRating({ rating, onChange, label = 'Rating' }: { rating: number; onChange?: (rating: number) => void; label?: string }) {
  return <div className={`goon-rating ${onChange ? 'interactive' : ''}`} role={onChange ? 'radiogroup' : 'img'} aria-label={`${label}: ${rating} out of 5`}>
    {[1,2,3,4,5].map((value) => onChange ? <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} out of 5`} onClick={() => onChange(value)} className={value <= rating ? 'selected' : ''}><img src={goonImage} alt="" /></button> : <img key={value} src={goonImage} alt="" className={value <= rating ? 'selected' : ''} />)}
  </div>
}
