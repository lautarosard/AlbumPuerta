import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { CloseIcon, TrophyIcon } from '../ui/icons'
import { Modal } from '../ui/Modal'

interface RewardModalProps {
  open: boolean
  onClose: () => void
  userId: string
}

const TITLE_ID = 'reward-modal-title'
const MAX_TILT_DEG = 10

export function RewardModal({ open, onClose, userId }: RewardModalProps) {
  return (
    <Modal open={open} onClose={onClose} labelledBy={TITLE_ID} variant="center" surface={false}>
      <RewardCredential userId={userId} onClose={onClose} />
    </Modal>
  )
}

function pad(n: number, size = 2): string {
  return String(n).padStart(size, '0')
}

function formatClock(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}:${pad(date.getMilliseconds(), 3)}`
}

/**
 * Live HH:MM:SS:ms clock. Written straight to the DOM every frame so a
 * screenshot is instantly stale, without re-rendering React at 60 fps.
 */
function LiveClock() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let frame = 0
    const tick = () => {
      if (ref.current) ref.current.textContent = formatClock(new Date())
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <span
      ref={ref}
      role="timer"
      aria-label="Hora actual"
      className="font-display text-5xl tabular-nums tracking-wider text-white"
    />
  )
}

function RewardCredential({ userId, onClose }: { userId: string; onClose: () => void }) {
  const tiltRef = useRef<HTMLDivElement>(null)

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const card = tiltRef.current
    if (!card || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = card.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    card.style.transform = `perspective(900px) rotateX(${(-y * MAX_TILT_DEG).toFixed(2)}deg) rotateY(${(x * MAX_TILT_DEG).toFixed(2)}deg)`
  }

  function resetTilt() {
    if (tiltRef.current) tiltRef.current.style.transform = ''
  }

  const [today] = useState(() =>
    new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }),
  )

  return (
    <div className="p-1">
      <div
        ref={tiltRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
        onPointerCancel={resetTilt}
        className="rounded-3xl transition-transform duration-150 ease-out will-change-transform motion-safe:animate-glow"
      >
        <div className="bg-holo rounded-3xl p-1 motion-safe:animate-holo">
          <div className="relative overflow-hidden rounded-[1.25rem] bg-brand-dark px-5 pb-6 pt-5 text-center">
            {/* Moving foil + sheen: hard to fake with a still image. */}
            <span
              aria-hidden="true"
              className="bg-holo pointer-events-none absolute inset-0 opacity-20 mix-blend-screen motion-safe:animate-holo"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent motion-safe:animate-sheen"
            />
            <span aria-hidden="true" className="bg-halftone pointer-events-none absolute inset-0 opacity-40" />

            <div className="relative">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar pasaporte"
                  className="rounded-full bg-white/10 p-1.5 text-white/70 hover:text-white"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>

              <TrophyIcon className="mx-auto h-12 w-12 text-brand-yellow" strokeWidth={1.75} />

              <h2 id={TITLE_ID} className="mt-2 font-display leading-none">
                <span className="block text-3xl tracking-wide text-white">
                  PASAPORTE DE INSPECTOR URBANO
                </span>
                <span className="sr-only"> - </span>
                <span className="mt-2 inline-block -rotate-3 border-4 border-brand-magenta px-3 pt-1 text-3xl tracking-[0.2em] text-brand-magenta">
                  COMPLETADO
                </span>
              </h2>

              <div className="mt-5 rounded-xl border border-white/15 bg-black/40 px-3 py-2">
                <LiveClock />
                <p className="text-xs uppercase tracking-widest text-white/60">{today}</p>
              </div>

              <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-widest text-white/50">
                Inspector #{userId.slice(0, 8)}
              </p>

              <p className="mt-4 text-sm font-semibold leading-snug text-brand-yellow">
                Mostrá esta pantalla interactiva en el puesto de Informes para canjear tu premio
                físico
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-4 w-full rounded-2xl bg-brand-surface py-3 font-display text-xl tracking-wider text-white/80 transition-colors hover:text-white"
      >
        Seguir viendo el álbum
      </button>
    </div>
  )
}
