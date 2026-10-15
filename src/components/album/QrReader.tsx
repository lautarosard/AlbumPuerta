import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

type CameraError = 'denied' | 'not-found' | 'in-use' | 'insecure' | 'unknown'
type Status = { kind: 'starting' } | { kind: 'scanning' } | { kind: 'error'; error: CameraError }

const errorCopy: Record<CameraError, { title: string; help: string }> = {
  denied: {
    title: 'Necesitamos permiso para usar la cámara',
    help: 'Tocá el ícono de candado o de cámara junto a la dirección web, permití el acceso a la cámara y volvé a intentarlo.',
  },
  'not-found': {
    title: 'No encontramos una cámara',
    help: 'Este dispositivo no tiene una cámara disponible.',
  },
  'in-use': {
    title: 'La cámara está ocupada',
    help: 'Otra app está usando la cámara. Cerrala y volvé a intentarlo.',
  },
  insecure: {
    title: 'La cámara no está disponible',
    help: 'El navegador solo permite usar la cámara en sitios seguros (https).',
  },
  unknown: {
    title: 'No pudimos iniciar la cámara',
    help: 'Volvé a intentarlo en unos segundos.',
  },
}

// html5-qrcode rejects with DOMExceptions, Errors or plain strings depending on
// the browser, so classify by the error name appearing anywhere in the text.
function classifyError(error: unknown): CameraError {
  const text = error instanceof Error ? `${error.name} ${error.message}` : String(error)
  if (/NotAllowed|Permission|denied/i.test(text)) return 'denied'
  if (/NotFound|Overconstrained|no camera|device not found/i.test(text)) return 'not-found'
  if (/NotReadable|TrackStart|Could not start/i.test(text)) return 'in-use'
  return 'unknown'
}

// Stops any stream still attached to a <video> under `root`. html5-qrcode
// loses track of its stream if start() is interrupted, so this is the
// last line of defence against a camera left running in the background.
function releaseVideoStreams(root: HTMLElement) {
  root.querySelectorAll('video').forEach((video) => {
    // Only stop tracks; clearing srcObject would reject html5-qrcode's own
    // pending play() with an unhandled AbortError.
    if (video.srcObject instanceof MediaStream) {
      video.srcObject.getTracks().forEach((track) => track.stop())
    }
  })
}

// Scanners that are still shutting down are parked here, hidden but still in
// the document: detaching a <video> mid-start aborts its play() and leaves
// html5-qrcode's start() hanging with the camera on.
function getParkingLot(): HTMLElement {
  let lot = document.getElementById('qr-reader-parking')
  if (!lot) {
    lot = document.createElement('div')
    lot.id = 'qr-reader-parking'
    lot.hidden = true
    document.body.appendChild(lot)
  }
  return lot
}

let readerCount = 0

interface QrReaderProps {
  /** Called once with the decoded text, after the camera has been stopped. */
  onDecode: (text: string) => void
}

export function QrReader({ onDecode }: QrReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onDecodeRef = useRef(onDecode)
  // Browsers only expose the camera on https or localhost.
  const [status, setStatus] = useState<Status>(() =>
    // DOM typings claim mediaDevices always exists; it is undefined on http.
    window.isSecureContext && typeof navigator.mediaDevices?.getUserMedia === 'function'
      ? { kind: 'starting' }
      : { kind: 'error', error: 'insecure' },
  )
  const [attempt, setAttempt] = useState(0)
  const cameraAvailable = !(status.kind === 'error' && status.error === 'insecure')

  useEffect(() => {
    onDecodeRef.current = onDecode
  }, [onDecode])

  function retry() {
    setStatus({ kind: 'starting' })
    setAttempt((n) => n + 1)
  }

  // A layout effect so cleanup runs while the container is still attached,
  // giving us the chance to park the scanner before React removes the DOM.
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || !cameraAvailable) return

    // Each mount gets its own target element so a quick remount (StrictMode,
    // retry) never shares a node with a scanner that is still shutting down.
    const target = document.createElement('div')
    target.id = `qr-reader-${++readerCount}`
    target.className = 'h-full w-full'
    container.appendChild(target)

    let cancelled = false
    let decoded = false
    let scanner: Html5Qrcode | null = null
    let starting: Promise<void> = Promise.resolve()
    let stopping: Promise<void> | null = null

    // Idempotent: releases the camera and removes the scanner's DOM.
    function stop(): Promise<void> {
      stopping ??= (async () => {
        try {
          if (scanner?.isScanning) await scanner.stop()
        } catch {
          // Already stopped or never started.
        }
        releaseVideoStreams(target)
        try {
          scanner?.clear()
        } catch {
          // Nothing rendered to clear.
        }
        target.remove()
      })()
      return stopping
    }

    function begin() {
      const instance = new Html5Qrcode(target.id, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        useBarCodeDetectorIfSupported: true,
        verbose: false,
      })
      scanner = instance
      starting = instance
        .start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: (width, height) => {
              const size = Math.max(50, Math.floor(Math.min(width, height) * 0.7))
              return { width: size, height: size }
            },
          },
          (text) => {
            if (decoded || cancelled) return
            decoded = true
            void stop().then(() => {
              if (!cancelled) onDecodeRef.current(text)
            })
          },
          () => {
            // Per-frame "no QR found" callback; intentionally silent.
          },
        )
        .then(() => {
          if (!cancelled) setStatus({ kind: 'scanning' })
        })
        .catch((error: unknown) => {
          if (!cancelled) setStatus({ kind: 'error', error: classifyError(error) })
        })
    }

    // Deferred one tick so StrictMode's throwaway mount (cleaned up
    // synchronously) never opens the camera at all.
    const timer = window.setTimeout(begin, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      if (!scanner) {
        target.remove()
        return
      }
      if (!stopping) getParkingLot().appendChild(target)
      // Wait for an in-flight start to settle, then stop the stream it opened.
      void starting.finally(stop)
    }
  }, [attempt, cameraAvailable])

  return (
    <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-black [&_video]:h-full [&_video]:!w-full [&_video]:object-cover">
      <div ref={containerRef} className="h-full w-full" />

      {status.kind === 'starting' && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
          Activando cámara…
        </p>
      )}

      {status.kind === 'error' && (
        <div
          role="alert"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-brand-surface p-6 text-center"
        >
          <p className="font-display text-2xl text-brand-magenta">
            {errorCopy[status.error].title}
          </p>
          <p className="text-sm text-white/80">{errorCopy[status.error].help}</p>
          <p className="text-xs text-white/60">
            También podés escanear el QR del taller con la app de cámara de tu teléfono.
          </p>
          {status.error !== 'insecure' && status.error !== 'not-found' && (
            <button
              type="button"
              onClick={retry}
              className="rounded-full bg-brand-cyan px-5 py-2 text-sm font-semibold text-brand-dark"
            >
              Reintentar
            </button>
          )}
        </div>
      )}
    </div>
  )
}
