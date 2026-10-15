import { useEffect } from 'react'

export type ToastVariant = 'success' | 'info' | 'error'

interface ToastProps {
  /** Nothing is shown while null, but the live region stays mounted. */
  message: string | null
  variant?: ToastVariant
  onDismiss: () => void
  /** Auto-dismiss delay in ms; 0 keeps the toast until closed. */
  duration?: number
  /** Change to restart the timer when the same message is shown again. */
  nonce?: number
  /** Lift the toast above a fixed bottom action bar. */
  aboveFab?: boolean
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-brand-cyan',
  info: 'border-brand-yellow',
  error: 'border-brand-magenta',
}

const variantIcons: Record<ToastVariant, string> = {
  success: '★',
  info: 'i',
  error: '!',
}

export function Toast({
  message,
  variant = 'info',
  onDismiss,
  duration = 4000,
  nonce,
  aboveFab = false,
}: ToastProps) {
  useEffect(() => {
    if (!message || duration <= 0) return
    const timer = window.setTimeout(onDismiss, duration)
    return () => window.clearTimeout(timer)
  }, [message, duration, onDismiss, nonce])

  // The live region must exist before its content changes for screen readers
  // to announce it, so it is always rendered and only its content toggles.
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 ${
        aboveFab
          ? 'pb-[calc(max(1rem,env(safe-area-inset-bottom))+5rem)]'
          : 'pb-[max(1rem,env(safe-area-inset-bottom))]'
      }`}
    >
      {message && (
        <div
          key={nonce}
          className={`motion-safe:animate-fade-in pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border-l-4 bg-brand-surface px-4 py-3 shadow-lg shadow-black/50 ${variantStyles[variant]}`}
        >
          <span aria-hidden="true" className="font-display text-xl">
            {variantIcons[variant]}
          </span>
          <p className="flex-1 text-sm">{message}</p>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Cerrar notificación"
            className="rounded px-2 text-lg leading-none text-white/70 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
