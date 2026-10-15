import type { Stand } from '../../types'
import { accentStyle, prefersDarkText, stickerNumber, validHexColor } from '../../utils/format'
import { LockIcon } from '../ui/icons'
import { CromoImage } from './CromoImage'

interface CromoCardProps {
  stand: Stand
  /** 1-based sticker number shown on the card. */
  number: number
  unlocked: boolean
  /** Just unlocked by a scan: plays the pop + flash animation. */
  isNew?: boolean
  onOpen: (stand: Stand) => void
  onLockedTap: (stand: Stand) => void
}

const baseCard =
  'relative block aspect-[3/4] w-full overflow-hidden rounded-2xl text-left transition-transform duration-200 ease-out focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow active:scale-95'

export function CromoCard({ stand, number, unlocked, isNew, onOpen, onLockedTap }: CromoCardProps) {
  if (!unlocked) {
    return (
      <button
        type="button"
        data-stand-id={stand.id}
        onClick={() => onLockedTap(stand)}
        aria-label={`Cromo ${number} bloqueado, ${stand.zone}. Escaneá su QR para desbloquearlo.`}
        className={`${baseCard} bg-halftone border-2 border-dashed border-white/20 bg-brand-surface`}
      >
        <span className="absolute left-3 top-3 font-display text-lg text-white/40">
          {stickerNumber(number)}
        </span>
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span className="rounded-full border-2 border-white/15 bg-brand-dark p-3 text-white/50">
            <LockIcon className="h-7 w-7" />
          </span>
          <span className="font-display text-2xl tracking-widest text-white/30">???</span>
        </span>
        <span className="absolute inset-x-0 bottom-3 text-center text-[0.65rem] font-semibold uppercase tracking-widest text-white/40">
          {stand.zone}
        </span>
      </button>
    )
  }

  const darkBadgeText = prefersDarkText(validHexColor(stand.themeColor) ?? '')

  return (
    <button
      type="button"
      data-stand-id={stand.id}
      onClick={() => onOpen(stand)}
      aria-label={`${stand.name}, ${stand.zone}. Ver detalle del cromo ${number}.`}
      style={accentStyle(stand)}
      className={`${baseCard} border-4 border-[color:var(--accent)] bg-brand-surface hover:-rotate-1 ${
        isNew ? 'motion-safe:animate-cromo-new' : ''
      }`}
    >
      <CromoImage src={stand.imageUrl} name={stand.name} decorative className="absolute inset-0 h-full w-full" />
      <span className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/30 to-transparent" />

      <span className="absolute left-2 top-2 rounded bg-brand-dark/80 px-1.5 font-display text-base text-white/80">
        {stickerNumber(number)}
      </span>
      {isNew && (
        <span className="absolute right-1 top-2 rotate-6 rounded bg-brand-yellow px-2 font-display text-lg text-brand-dark shadow">
          ¡NUEVO!
        </span>
      )}

      <span className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-1 p-3">
        <span
          className={`rounded px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider bg-[color:var(--accent)] ${
            darkBadgeText ? 'text-brand-dark' : 'text-white'
          }`}
        >
          {stand.zone}
        </span>
        <span className="font-display text-2xl leading-none tracking-wide">{stand.name}</span>
      </span>
    </button>
  )
}
