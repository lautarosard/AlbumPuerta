import { useEffect } from 'react'

export type ToastVariant = 'success' | 'info' | 'error'

interface ToastProps {
  /** Nothing is shown while null, but the live region stays mounted. */
  message: string | null
  variant?: ToastVariant
  onDismiss: () => void
  /** Auto-dismiss delay in ms; 0 keeps the toast until closed. */
  duration?: number
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

export function Toast({ message, variant = 'info', onDismiss, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (!message || duration <= 0) return
    const timer = window.setTimeout(onDismiss, duration)
    return () => window.clearTimeout(timer)
  }, [message, duration, onDismiss])

  // The live region must exist before its content changes for screen readers
  // to announce it, so it is always rendered and only its content toggles.
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      {message && (
        <div
          className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border-l-4 bg-brand-surface px-4 py-3 shadow-lg ${variantStyles[variant]}`}
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
