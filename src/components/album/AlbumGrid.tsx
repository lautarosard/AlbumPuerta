import { useEffect } from 'react'
import type { Stand } from '../../types'
import { CromoCard } from './CromoCard'

interface AlbumGridProps {
  stands: Stand[]
  unlockedIds: string[]
  /** Stand to scroll into view (e.g. the one just scanned). */
  focusId?: string
  /** Stand that was just unlocked and should animate. */
  newId?: string
  onOpen: (stand: Stand) => void
  onLockedTap: (stand: Stand) => void
}

export function AlbumGrid({
  stands,
  unlockedIds,
  focusId,
  newId,
  onOpen,
  onLockedTap,
}: AlbumGridProps) {
  useEffect(() => {
    if (!focusId) return
    const card = document.querySelector(`[data-stand-id="${CSS.escape(focusId)}"]`)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    card?.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [focusId])

  return (
    <ul className="grid grid-cols-2 gap-4" aria-label="Cromos del álbum">
      {stands.map((stand, index) => (
        <li key={stand.id}>
          <CromoCard
            stand={stand}
            number={index + 1}
            unlocked={unlockedIds.includes(stand.id)}
            isNew={stand.id === newId}
            onOpen={onOpen}
            onLockedTap={onLockedTap}
          />
        </li>
      ))}
    </ul>
  )
}
