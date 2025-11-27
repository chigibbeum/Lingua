import type { PosChipFormat } from '../../schemas/settings'
import type { DecodedIdToken } from 'firebase-admin/auth'
import { Buffer } from 'node:buffer'
import { Timestamp, type DocumentData } from 'firebase-admin/firestore'
import { adminAuth, adminDb } from '$lib/firebase/admin'

export const SESSION_COOKIE = 'lingua-auth'

export type DevClaims = {
  uid: string | null
  email: string | null
  displayName: string | null
  photoURL: string | null
  exp: number | null
  authTime: number | null
  emailVerified: boolean
}

type SessionClaims = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  expiresAt: number | null
  issuedAt: number | null
  authTime: number | null
  emailVerified: boolean
}

export type ServerUserProfile = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  emailVerifiedAt?: string | null
  lastSessionAt?: string | null
}

export type ServerUserSettings = {
  posChipFormat?: PosChipFormat
  theme?: 'system' | 'light' | 'dark'
  reduceMotion?: boolean
  showTips?: boolean
  updatedAt?: string | null
}

export type SessionVerificationResult =
  | {
      valid: true
      uid: string
      user: ServerUserProfile
      settings: ServerUserSettings | null
    }
  | {
      valid: false
    }

const DEFAULT_SETTINGS: ServerUserSettings = {
  posChipFormat: 'short',
  theme: 'dark',
  reduceMotion: false,
  showTips: true,
}

export function decodeJwtClaims(token: string): DevClaims | null {
  const parts = token.split('.')
  if (parts.length < 2) return null

  const payload = parts[1]

  try {
    const normalized = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payload.length / 4) * 4, '=')
    const jsonString = Buffer.from(normalized, 'base64').toString('utf8')
    const parsed = JSON.parse(jsonString)
    return {
      uid: parsed.user_id ?? parsed.sub ?? null,
      email: parsed.email ?? null,
      displayName: parsed.name ?? null,
      photoURL: parsed.picture ?? null,
      exp: typeof parsed.exp === 'number' ? parsed.exp : null,
      authTime: typeof parsed.auth_time === 'number' ? parsed.auth_time : null,
      emailVerified: Boolean(parsed.email_verified),
    }
  } catch {
    return null
  }
}

export function isSecureRequest(request: Request): boolean {
  const forwardedProto = request.headers.get('x-forwarded-proto')
  if (forwardedProto) {
    const first = forwardedProto.split(',')[0]?.trim().toLowerCase()
    if (first === 'https') return true
    if (first === 'http') return false
  }

  try {
    return new URL(request.url).protocol === 'https:'
  } catch {
    return false
  }
}

export async function verifySessionCookie(
  sessionCookie: string | null | undefined
): Promise<SessionVerificationResult> {
  if (!sessionCookie) {
    return {
      valid: false,
    }
  }

  if (adminAuth) {
    try {
      const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
      const claims = mapDecodedIdToken(decoded)
      const { user, settings } = await buildServerUserState(claims)
      return {
        valid: true,
        uid: claims.uid,
        user,
        settings,
      }
    } catch (error) {
      console.warn('[auth] Failed to verify session cookie via Admin SDK', error)
      return {
        valid: false,
      }
    }
  }

  const fallbackClaims = decodeJwtClaims(sessionCookie)
  if (!fallbackClaims?.uid || typeof fallbackClaims.exp !== 'number') {
    return {
      valid: false,
    }
  }

  const now = Math.floor(Date.now() / 1000)
  if (fallbackClaims.exp <= now) {
    return {
      valid: false,
    }
  }

  const claims = mapDevClaims(fallbackClaims)
  const { user, settings } = await buildServerUserState(claims)

  return {
    valid: true,
    uid: claims.uid,
    user,
    settings,
  }
}

async function buildServerUserState(claims: SessionClaims): Promise<{
  user: ServerUserProfile
  settings: ServerUserSettings | null
}> {
  if (!adminDb) {
    return {
      user: createProfileFromClaims(claims),
      settings: DEFAULT_SETTINGS,
    }
  }

  try {
    const [userDoc, settingsDoc] = await Promise.all([
      ensureUserDocument(claims),
      ensureSettingsDocument(claims.uid),
    ])

    return {
      user: normalizeUserDoc(claims, userDoc),
      settings: normalizeSettingsDoc(settingsDoc) ?? DEFAULT_SETTINGS,
    }
  } catch (error) {
    console.warn('[auth] Unable to hydrate user/settings from Firestore', error)
    return {
      user: createProfileFromClaims(claims),
      settings: DEFAULT_SETTINGS,
    }
  }
}

async function ensureUserDocument(claims: SessionClaims): Promise<DocumentData | null> {
  if (!adminDb) return null
  const ref = adminDb.collection('users').doc(claims.uid)
  const snapshot = await ref.get()

  if (!snapshot.exists) {
    const payload: DocumentData = {
      email: claims.email ?? null,
      displayName: claims.displayName ?? claims.email ?? null,
      photoURL: claims.photoURL ?? null,
      username: null,
      firstName: null,
      lastName: null,
      emailVerifiedAt: claims.emailVerified ? timestampFromSeconds(claims.authTime) : null,
      lastSessionAt: timestampFromSeconds(claims.authTime ?? claims.issuedAt),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    await ref.set(payload, {
      merge: true,
    })
    return payload
  }

  const data: DocumentData = snapshot.data() ?? (Object.create(null) as DocumentData)
  const updates: Record<string, unknown> = Object.create(null)

  if (!data.email && claims.email) updates.email = claims.email
  if (!data.displayName && claims.displayName) updates.displayName = claims.displayName
  if (!data.photoURL && claims.photoURL) updates.photoURL = claims.photoURL
  if (claims.emailVerified && !data.emailVerifiedAt && claims.authTime) {
    updates.emailVerifiedAt = timestampFromSeconds(claims.authTime)
  }

  if (Object.keys(updates).length) {
    updates.updatedAt = Timestamp.now()
    await ref.set(updates, {
      merge: true,
    })
    return {
      ...data,
      ...updates,
    }
  }

  return data
}

async function ensureSettingsDocument(uid: string): Promise<DocumentData | null> {
  if (!adminDb) return null
  const ref = adminDb.collection('settings').doc(uid)
  const snapshot = await ref.get()

  if (!snapshot.exists) {
    const payload: DocumentData = {
      posChipFormat: DEFAULT_SETTINGS.posChipFormat,
      theme: DEFAULT_SETTINGS.theme,
      reduceMotion: DEFAULT_SETTINGS.reduceMotion,
      showTips: DEFAULT_SETTINGS.showTips,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    await ref.set(payload, {
      merge: true,
    })
    return payload
  }

  return snapshot.data() ?? (Object.create(null) as DocumentData)
}

function mapDecodedIdToken(token: DecodedIdToken): SessionClaims {
  return {
    uid: token.uid,
    email: token.email ?? null,
    displayName: token.name ?? null,
    photoURL: token.picture ?? null,
    expiresAt: typeof token.exp === 'number' ? token.exp : null,
    issuedAt: typeof token.iat === 'number' ? token.iat : null,
    authTime: typeof token.auth_time === 'number' ? token.auth_time : null,
    emailVerified: Boolean(token.email_verified),
  }
}

function mapDevClaims(claims: DevClaims): SessionClaims {
  return {
    uid: claims.uid!,
    email: claims.email ?? null,
    displayName: claims.displayName ?? null,
    photoURL: claims.photoURL ?? null,
    expiresAt: typeof claims.exp === 'number' ? claims.exp : null,
    issuedAt: typeof claims.exp === 'number' ? claims.exp : null,
    authTime: claims.authTime ?? claims.exp ?? null,
    emailVerified: claims.emailVerified,
  }
}

function createProfileFromClaims(claims: SessionClaims): ServerUserProfile {
  return {
    uid: claims.uid,
    email: claims.email,
    displayName: claims.displayName ?? claims.email,
    photoURL: claims.photoURL,
    username: null,
    firstName: null,
    lastName: null,
    createdAt: claims.issuedAt ? new Date(claims.issuedAt * 1000).toISOString() : null,
    updatedAt: null,
    emailVerifiedAt: claims.emailVerified ? fallbackEmailVerifiedAt(claims) : null,
    lastSessionAt: claims.authTime ? new Date(claims.authTime * 1000).toISOString() : null,
  }
}

function normalizeUserDoc(claims: SessionClaims, doc: DocumentData | null): ServerUserProfile {
  return {
    uid: claims.uid,
    email: stringOrNull(doc?.email) ?? claims.email,
    displayName: stringOrNull(doc?.displayName) ?? claims.displayName ?? claims.email,
    photoURL: stringOrNull(doc?.photoURL) ?? claims.photoURL,
    username: stringOrNull(doc?.username),
    firstName: stringOrNull(doc?.firstName),
    lastName: stringOrNull(doc?.lastName),
    createdAt:
      normalizeTimestamp(doc?.createdAt) ??
      (claims.issuedAt ? new Date(claims.issuedAt * 1000).toISOString() : null),
    updatedAt: normalizeTimestamp(doc?.updatedAt),
    emailVerifiedAt:
      normalizeTimestamp(doc?.emailVerifiedAt) ??
      (claims.emailVerified ? fallbackEmailVerifiedAt(claims) : null),
    lastSessionAt:
      normalizeTimestamp(doc?.lastSessionAt) ??
      (claims.authTime ? new Date(claims.authTime * 1000).toISOString() : null),
  }
}

function normalizeSettingsDoc(doc: DocumentData | null): ServerUserSettings | null {
  if (!doc) return null
  return {
    posChipFormat: parsePosChipFormat(doc.posChipFormat),
    theme: parseTheme(doc.theme),
    reduceMotion:
      typeof doc.reduceMotion === 'boolean' ? doc.reduceMotion : DEFAULT_SETTINGS.reduceMotion,
    showTips: typeof doc.showTips === 'boolean' ? doc.showTips : DEFAULT_SETTINGS.showTips,
    updatedAt: normalizeTimestamp(doc.updatedAt),
  }
}

function stringOrNull(value: unknown): string | null {
  if (typeof value === 'string') return value
  return null
}

function normalizeTimestamp(value: unknown): string | null {
  if (!value) return null
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'number') return new Date(value).toISOString()
  if (typeof value === 'string') return value
  return null
}

function timestampFromSeconds(seconds: number | null): Timestamp | null {
  if (!seconds) return null
  return Timestamp.fromMillis(seconds * 1000)
}

function fallbackEmailVerifiedAt(claims: SessionClaims): string | null {
  if (!claims.emailVerified) return null
  if (claims.authTime) return new Date(claims.authTime * 1000).toISOString()
  if (claims.issuedAt) return new Date(claims.issuedAt * 1000).toISOString()
  return new Date().toISOString()
}

function parsePosChipFormat(value: unknown): PosChipFormat | undefined {
  if (value === 'short' || value === 'full' || value === 'hidden') {
    return value
  }
  return undefined
}

function parseTheme(value: unknown): 'system' | 'light' | 'dark' | undefined {
  if (value === 'system' || value === 'light' || value === 'dark') {
    return value
  }
  return undefined
}
