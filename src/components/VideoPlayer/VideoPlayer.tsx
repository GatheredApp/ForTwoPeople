import { useEffect, useState } from 'react'

interface VideoPlayerProps {
  videoId?: string
  title: string
  playSignal: number
}

export function VideoPlayer({ videoId, title, playSignal }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false)
  useEffect(() => setPlaying(false), [videoId])
  useEffect(() => { if (playSignal > 0 && videoId) setPlaying(true) }, [playSignal, videoId])

  if (!videoId) return <div className="video-unavailable">Review video not available.</div>
  if (playing) {
    return (
      <div className="video-frame">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1`}
          title={`${title} video review`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    )
  }
  return (
    <button className="video-preview" type="button" onClick={() => setPlaying(true)} aria-label={`Play review of ${title}`}>
      <img src={`https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`} alt="" loading="lazy" />
      <span className="play-icon" aria-hidden="true">▶</span>
      <strong>Play review</strong>
    </button>
  )
}
