import type { Stand } from '../../types'
import {
  accentStyle,
  formatNames,
  prefersDarkText,
  stickerNumber,
  validHexColor,
} from '../../utils/format'
import { CloseIcon } from '../ui/icons'
import { Modal } from '../ui/Modal'
import { CromoImage } from './CromoImage'

interface CromoModalProps {
  /** The stand to show; the sheet is closed while null. */
  stand: Stand | null
  number: number
  onClose: () => void
}

const TITLE_ID = 'cromo-modal-title'

export function CromoModal({ stand, number, onClose }: CromoModalProps) {
  return (
    <Modal
      open={stand !== null}
      onClose={onClose}
      labelledBy={TITLE_ID}
      style={stand ? accentStyle(stand) : undefined}
      className="border-t-4 border-[color:var(--accent)]"
    >
      {stand && <CromoDetail stand={stand} number={number} onClose={onClose} />}
    </Modal>
  )
}

function CromoDetail({ stand, number, onClose }: { stand: Stand; number: number; onClose: () => void }) {
  const darkZoneText = prefersDarkText(validHexColor(stand.themeColor) ?? '')

  return (
    <article className="pb-safe px-5 pt-3">
      <div aria-hidden="true" className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/20" />

      <div className="flex items-center justify-between">
        <span className="font-display text-xl text-white/50">{stickerNumber(number)}</span>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          aria-label="Cerrar detalle"
          className="rounded-full bg-brand-dark p-2 text-white/70 transition-colors hover:text-white"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Sticker taped onto the page. */}
      <figure className="relative mx-auto mt-4 w-4/5 -rotate-2 bg-white p-2 pb-3 shadow-xl shadow-black/60">
        <span
          aria-hidden="true"
          className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-3 bg-brand-yellow/80"
        />
        <CromoImage
          src={stand.imageUrl}
          name={stand.name}
          loading="eager"
          className="aspect-[4/5] w-full"
        />
      </figure>

      <header className="mt-6 space-y-2">
        <span
          className={`inline-block -rotate-1 rounded px-2 py-0.5 text-xs font-bold uppercase tracking-widest bg-[color:var(--accent)] ${
            darkZoneText ? 'text-brand-dark' : 'text-white'
          }`}
        >
          {stand.zone}
        </span>
        <h2 id={TITLE_ID} className="font-display text-5xl leading-none tracking-wide">
          {stand.name}
        </h2>
      </header>

      {stand.creators.length > 0 && (
        <p className="mt-3 text-sm text-white/80">
          <span className="font-semibold text-brand-cyan">Creadores:</span>{' '}
          {formatNames(stand.creators)}
        </p>
      )}

      {stand.technologies.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tecnologías">
          {stand.technologies.map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-brand-violet bg-brand-violet/20 px-3 py-1 text-xs font-semibold"
            >
              {tech}
            </li>
          ))}
        </ul>
      )}

      {stand.plotTwist && (
        <section
          aria-labelledby="plot-twist-title"
          className="relative mt-8 rotate-1 overflow-hidden bg-brand-yellow px-4 pb-4 pt-7 text-brand-dark shadow-lg shadow-black/50"
        >
          <span aria-hidden="true" className="bg-tape-stripes absolute inset-x-0 top-0 h-3" />
          <h3 id="plot-twist-title" className="font-display text-2xl tracking-wide">
            LA VUELTA DE TUERCA
          </h3>
          <p className="mt-1 text-sm leading-relaxed">{stand.plotTwist}</p>
        </section>
      )}

      <button
        type="button"
        onClick={onClose}
        className="mt-8 w-full rounded-2xl border-2 border-white/20 py-3 font-display text-2xl tracking-wider transition-colors hover:border-[color:var(--accent)] active:scale-[0.98]"
      >
        Volver al Álbum
      </button>
    </article>
  )
}
