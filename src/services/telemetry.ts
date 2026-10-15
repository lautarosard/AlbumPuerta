const TELEMETRY_URL = '/api/telemetry'

/**
 * Reports a first-time sticker unlock. Fire-and-forget: never throws, never
 * blocks navigation, and silently drops the event if the network is down.
 */
export function trackScan(userId: string, standId: string): void {
  try {
    const payload = JSON.stringify({ userId, standId })

    // sendBeacon survives the redirect that follows a scan. A plain string is
    // sent as text/plain, which needs no CORS preflight; the API parses it.
    if (typeof navigator.sendBeacon === 'function' && navigator.sendBeacon(TELEMETRY_URL, payload)) {
      return
    }

    // No beacon support, or the browser refused to queue it.
    void fetch(TELEMETRY_URL, {
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      keepalive: true,
      credentials: 'same-origin',
    }).catch(() => {
      // Telemetry must never affect the album.
    })
  } catch {
    // Same: swallow anything unexpected (e.g. blocked by an extension).
  }
}
