import { neon } from '@neondatabase/serverless'
import type { NeonQueryFunction } from '@neondatabase/serverless'
import stands from '../src/data/stands.json' with { type: 'json' }

// Vercel Function (Web-standard signature): POST /api/telemetry
// Body: { "userId": "<uuid>", "standId": "<stand id>" }
// Records a first-time sticker unlock. Responses never echo internals.

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const STAND_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/
const VALID_STAND_IDS: ReadonlySet<string> = new Set(stands.map((stand) => stand.id))
// The real payload is ~80 bytes; anything far larger is not ours.
const MAX_BODY_BYTES = 1024

let sql: NeonQueryFunction<false, false> | null = null

function getSql(): NeonQueryFunction<false, false> | null {
  const url = process.env.DATABASE_URL
  if (!url) return null
  sql ??= neon(url)
  return sql
}

function json(body: unknown, status: number, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  })
}

const fail = (error: string, status: number, headers?: Record<string, string>) =>
  json({ success: false, error }, status, headers)

/** Browsers always send Origin on POST; reject other sites posting here. */
function isCrossOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return false
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  try {
    return new URL(origin).host !== host
  } catch {
    return true
  }
}

interface ScanPayload {
  userId: string
  standId: string
}

function parsePayload(raw: string): ScanPayload | null {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof data !== 'object' || data === null) return null
  const { userId, standId } = data as Record<string, unknown>
  if (typeof userId !== 'string' || typeof standId !== 'string') return null
  return { userId: userId.trim(), standId: standId.trim() }
}

export async function POST(request: Request): Promise<Response> {
  if (isCrossOrigin(request)) return fail('Forbidden', 403)

  const declaredLength = Number(request.headers.get('content-length') ?? 0)
  if (declaredLength > MAX_BODY_BYTES) return fail('Payload too large', 413)

  // sendBeacon posts text/plain (a CORS-safelisted type), so parse the raw
  // text as JSON regardless of the declared content type.
  let raw: string
  try {
    raw = await request.text()
  } catch {
    return fail('Invalid body', 400)
  }
  if (raw.length > MAX_BODY_BYTES) return fail('Payload too large', 413)

  const payload = parsePayload(raw)
  if (!payload) return fail('Expected JSON body { userId, standId }', 400)
  if (!UUID_PATTERN.test(payload.userId)) return fail('Invalid userId', 400)
  if (!STAND_ID_PATTERN.test(payload.standId) || !VALID_STAND_IDS.has(payload.standId)) {
    return fail('Unknown standId', 400)
  }

  const db = getSql()
  if (!db) {
    console.error('telemetry: DATABASE_URL is not configured')
    return fail('Service unavailable', 503)
  }

  try {
    await db.query('INSERT INTO scans (user_id, stand_id) VALUES ($1, $2)', [
      payload.userId,
      payload.standId,
    ])
  } catch (error) {
    // Log only the error class/code: driver messages can include host names.
    const code = (error as { code?: string }).code ?? (error as Error).name
    console.error(`telemetry: insert failed (${code})`)
    return fail('Could not record scan', 500)
  }

  return json({ success: true }, 200)
}

const methodNotAllowed = () => fail('Method not allowed', 405, { Allow: 'POST' })

export {
  methodNotAllowed as GET,
  methodNotAllowed as PUT,
  methodNotAllowed as PATCH,
  methodNotAllowed as DELETE,
}
