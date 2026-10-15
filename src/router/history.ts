import { useSyncExternalStore } from 'react'

// Minimal History API router. The app has three routes, so this replaces
// react-router-dom at a fraction of the bundle size. Paths (not hashes) are
// used because printed QR codes point at real URLs like /scan?t=<token>.

export interface Location {
  /** Pathname without a trailing slash ("/" stays "/"). */
  pathname: string
  search: string
  state: unknown
}

export interface NavigateOptions {
  replace?: boolean
  state?: unknown
}

function readLocation(): Location {
  return {
    pathname: window.location.pathname.replace(/(.)\/+$/, '$1'),
    search: window.location.search,
    state: window.history.state as unknown,
  }
}

const listeners = new Set<() => void>()
// Rebuilt on every change (including state-only replaceState calls) so
// useSyncExternalStore sees a new snapshot exactly when something changed.
let snapshot = readLocation()

function notify() {
  snapshot = readLocation()
  listeners.forEach((listener) => listener())
}

window.addEventListener('popstate', notify)

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function navigate(to: string, { replace = false, state = null }: NavigateOptions = {}) {
  if (replace) {
    window.history.replaceState(state, '', to)
  } else {
    window.history.pushState(state, '', to)
  }
  notify()
}

export function useLocation(): Location {
  return useSyncExternalStore(subscribe, () => snapshot)
}
