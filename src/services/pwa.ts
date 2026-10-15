import { registerSW } from 'virtual:pwa-register'

// Not in lib.dom yet: Chromium-only event fired when the PWA is installable.
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface PwaState {
  /** A native install prompt is available (Chromium browsers). */
  canPrompt: boolean
  /** The app is already running as an installed PWA. */
  isInstalled: boolean
  /** The service worker has precached the app, so it works offline. */
  offlineReady: boolean
}

function isStandalone(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches
}

// Module-level store: install events can fire before React renders anything.
let deferredPrompt: BeforeInstallPromptEvent | null = null
let state: PwaState = {
  canPrompt: false,
  isInstalled: isStandalone(),
  // A controlling worker means a previous visit already cached the app.
  offlineReady: Boolean(navigator.serviceWorker?.controller),
}
const listeners = new Set<() => void>()

function setState(next: Partial<PwaState>) {
  state = { ...state, ...next }
  listeners.forEach((listener) => listener())
}

export function subscribePwa(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getPwaState(): PwaState {
  return state
}

/** iOS has no install prompt API; users must use Share → Add to Home Screen. */
export const isIos =
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  // iPadOS 13+ reports itself as a Mac.
  (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1)

/** Shows the native install prompt. Resolves true if the user accepted. */
export async function promptInstall(): Promise<boolean> {
  const prompt = deferredPrompt
  if (!prompt) return false
  // A prompt can only be shown once; Chromium fires a fresh event if allowed again.
  deferredPrompt = null
  setState({ canPrompt: false })
  await prompt.prompt()
  const { outcome } = await prompt.userChoice
  return outcome === 'accepted'
}

/**
 * Wires up install events and registers the service worker. Call once, before
 * rendering, so no early `beforeinstallprompt` is missed.
 */
export function initPwa(): void {
  window.addEventListener('beforeinstallprompt', (event) => {
    // Suppress Chrome's own mini-infobar; our banner offers the prompt instead.
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    setState({ canPrompt: true })
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    setState({ canPrompt: false, isInstalled: true })
  })

  // No-op in `vite dev` (the plugin only emits a worker for builds).
  registerSW({
    immediate: true,
    onOfflineReady: () => setState({ offlineReady: true }),
    onRegisterError: (error: unknown) => {
      // Offline support is an enhancement; the album still works online.
      console.warn('Service worker registration failed', error)
    },
  })
}
