import { useState } from 'react'

interface CromoImageProps {
  src: string
  /** Used for alt text and the fallback's initials. */
  name: string
  className?: string
  /** Decorative when the surrounding control already names the stand. */
  decorative?: boolean
  loading?: 'lazy' | 'eager'
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('')
}

/**
 * Stand artwork that degrades to a halftone placeholder instead of a broken
 * image icon (missing file, offline before it was cached, bad URL in data).
 */
export function CromoImage({
  src,
  name,
  className = '',
  decorative = false,
  loading = 'lazy',
}: CromoImageProps) {
  // Track the failed URL (not a boolean) so a new src gets a fresh attempt.
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (!src || failedSrc === src) {
    return (
      <div
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : name}
        aria-hidden={decorative || undefined}
        className={`bg-halftone flex items-center justify-center bg-brand-dark ${className}`}
      >
        <span className="font-display text-6xl text-[color:var(--accent)] opacity-80">
          {initials(name)}
        </span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={decorative ? '' : name}
      loading={loading}
      decoding="async"
      onError={() => setFailedSrc(src)}
      className={`object-cover ${className}`}
    />
  )
}
