import { useSyncExternalStore } from 'react'

// Not in lib.dom yet: Chromium-only event fired when the PWA is installable.
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallState {
  /** A native install prompt is available (Chromium browsers). */
  canPrompt: boolean
  /** The app is already running as an installed PWA. */
  isInstalled: boolean
}

// The event can fire before React mounts the banner, so it is captured at
// module load (this module ships in the main bundle) and kept here.
let deferredPrompt: BeforeInstallPromptEvent | null = null
let state: InstallState = { canPrompt: false, isInstalled: isStandalone() }
const listeners = new Set<() => void>()

function setState(next: Partial<InstallState>) {
  state = { ...state, ...next }
  listeners.forEach((listener) => listener())
}

function isStandalone(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches
}

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

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
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

export function useInstallPrompt(): InstallState {
  return useSyncExternalStore(subscribe, () => state)
}
