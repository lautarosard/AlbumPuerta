import { useState } from 'react'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'
import { isIos, promptInstall } from '../../services/pwa'
import { dismissInstallBanner, isInstallBannerDismissed } from '../../utils/storage'
import { CloseIcon, ShareIcon } from './icons'

/**
 * Discreet install banner. Uses the native prompt where the browser supports
 * it (Chromium fires it only once the manifest + service worker qualify), a
 * manual tip on iOS once the service worker has cached the app for offline
 * use, and stays hidden everywhere else or once installed.
 */
export function PwaBanner() {
  const { canPrompt, isInstalled, offlineReady } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(isInstallBannerDismissed)

  const showIosTip = !canPrompt && isIos && offlineReady
  if (dismissed || isInstalled || (!canPrompt && !showIosTip)) return null

  function close() {
    dismissInstallBanner()
    setDismissed(true)
  }

  return (
    <aside
      aria-label="Instalar la app"
      className="motion-safe:animate-fade-in flex items-start gap-3 rounded-xl border border-brand-violet/60 bg-brand-surface/90 px-3 py-2.5 text-sm"
    >
      <div className="flex-1">
        <p className="font-semibold">
          ¡Instalá la app para jugar sin <span className="whitespace-nowrap">conexión! 📲</span>
        </p>
        {showIosTip && (
          <p className="mt-1 text-xs text-white/70">
            Tocá <ShareIcon className="inline h-4 w-4 align-text-bottom text-brand-cyan" />{' '}
            <span className="sr-only">Compartir</span> y luego “Agregar a inicio”.
          </p>
        )}
      </div>
      {canPrompt && (
        <button
          type="button"
          onClick={() => void promptInstall()}
          className="shrink-0 rounded-full bg-brand-cyan px-3 py-1 text-xs font-bold uppercase text-brand-dark transition-transform active:scale-95"
        >
          Instalar
        </button>
      )}
      <button
        type="button"
        onClick={close}
        aria-label="Cerrar aviso de instalación"
        className="shrink-0 rounded-full p-1 text-white/60 transition-colors hover:text-white"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </aside>
  )
}
