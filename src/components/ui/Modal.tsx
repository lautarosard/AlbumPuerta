import { useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  /** id of the element that names the dialog. */
  labelledBy: string
  children: ReactNode
  /** 'sheet' slides up from the bottom; 'center' floats in the middle. */
  variant?: 'sheet' | 'center'
  /** Paint the default surface background; off for custom full-bleed content. */
  surface?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * Built on the native <dialog>: showModal() gives us the top layer, focus
 * containment, inert background and Escape-to-close for free.
 */
export function Modal({
  open,
  onClose,
  labelledBy,
  children,
  variant = 'sheet',
  surface = true,
  className = '',
  style,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      // Stop the album from scrolling underneath (iOS ignores inert scroll).
      document.documentElement.style.overflow = 'hidden'
    } else if (!open && dialog.open) {
      dialog.close()
    }
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    // Fires for Escape, form[method=dialog] and dialog.close() alike.
    const handleClose = () => onCloseRef.current()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [])

  const layout =
    variant === 'sheet'
      ? 'mb-0 mt-auto max-h-[92dvh] w-full max-w-md rounded-t-3xl motion-safe:animate-sheet-up'
      : 'm-auto max-h-[92dvh] w-[calc(100%-2rem)] max-w-sm rounded-3xl motion-safe:animate-fade-in'

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      style={style}
      // A click whose target is the <dialog> itself landed on the backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className={`overflow-y-auto overscroll-contain p-0 text-white backdrop:bg-black/75 backdrop:backdrop-blur-sm ${
        surface ? 'bg-brand-surface' : 'bg-transparent'
      } ${layout} ${className}`}
    >
      {open && children}
    </dialog>
  )
}
