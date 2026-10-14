'use client'

import { useRef, useState } from 'react'
import { Play } from 'lucide-react'

/**
 * The film's player. Until the first play it is the poster under one large
 * button that covers the whole picture, so a click anywhere on it starts the
 * film - native controls only answer to their own small play button in
 * Chromium - and a big centred play mark says "this is a video" where a dark
 * poster on a dark page otherwise reads as a still. Once it has started the
 * button is gone and the browser's own controls take over.
 *
 * The native controls are off until then, so the two play buttons never sit
 * on top of each other; `onPlay` covers a play from elsewhere (a media key,
 * picture-in-picture) as well as ours.
 */
export function FilmPlayer({ src, poster, label, duration }: { src: string; poster: string; label: string; duration: string }) {
  const video = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)

  const start = () => {
    setStarted(true)
    video.current?.play().catch(() => {})
  }

  return (
    <div className="film-player" data-started={started}>
      <video
        ref={video}
        className="film-video"
        controls={started}
        playsInline
        preload="none"
        width={1920}
        height={1080}
        poster={poster}
        aria-label={label}
        onPlay={() => setStarted(true)}
      >
        <source src={src} type="video/mp4" />
      </video>
      {!started && (
        <button type="button" className="film-cover" onClick={start} aria-label={`Play the film (${duration})`}>
          <span className="film-play" aria-hidden>
            <Play size={30} strokeWidth={0} fill="currentColor" />
          </span>
          <span className="film-cover-label" aria-hidden>
            Play film · {duration}
          </span>
        </button>
      )}
    </div>
  )
}
