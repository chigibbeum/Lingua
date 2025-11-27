// file: src/lib/firebase/client.ts
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics'
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { initializeFirestore, type Firestore } from 'firebase/firestore'
import { browser } from '$app/environment'

const sanitizeEnvValue = (raw: string): string => {
  let normalized = raw.trim()

  // Remove any stray trailing commas (common when copying JSON snippets)
  normalized = normalized.replace(/,+$/, '')

  const hasMatchingQuotes =
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))

  if (hasMatchingQuotes) {
    normalized = normalized.slice(1, -1)
  }

  return normalized
}

const requireEnv = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`[firebase] Missing ${key}. Set it in your .env file.`)
  }
  const sanitized = sanitizeEnvValue(value)
  if (!sanitized) {
    throw new Error(`[firebase] ${key} is empty after sanitization. Check your .env value.`)
  }
  return sanitized
}

const optionalEnv = (value: string | undefined): string | undefined => {
  if (!value) return undefined
  const sanitized = sanitizeEnvValue(value)
  return sanitized || undefined
}

// Firebase configuration for the Lingua client runtime
const firebaseConfig = {
  apiKey: requireEnv(import.meta.env.VITE_LINGUA_FIREBASE_API_KEY, 'VITE_LINGUA_FIREBASE_API_KEY'),
  authDomain: requireEnv(
    import.meta.env.VITE_LINGUA_FIREBASE_AUTH_DOMAIN,
    'VITE_LINGUA_FIREBASE_AUTH_DOMAIN'
  ),
  projectId: requireEnv(
    import.meta.env.VITE_LINGUA_FIREBASE_PROJECT_ID,
    'VITE_LINGUA_FIREBASE_PROJECT_ID'
  ),
  storageBucket: requireEnv(
    import.meta.env.VITE_LINGUA_FIREBASE_STORAGE_BUCKET,
    'VITE_LINGUA_FIREBASE_STORAGE_BUCKET'
  ),
  messagingSenderId: requireEnv(
    import.meta.env.VITE_LINGUA_FIREBASE_MESSAGING_SENDER_ID,
    'VITE_LINGUA_FIREBASE_MESSAGING_SENDER_ID'
  ),
  appId: requireEnv(import.meta.env.VITE_LINGUA_FIREBASE_APP_ID, 'VITE_LINGUA_FIREBASE_APP_ID'),
  measurementId: optionalEnv(import.meta.env.VITE_LINGUA_FIREBASE_MEASUREMENT_ID),
}

export let app: FirebaseApp | undefined
export let auth: Auth | undefined
export let db: Firestore | undefined
export let analytics: Analytics | undefined

const isTestEnv = (() => {
  try {
    // Vitest sets import.meta.vitest and MODE === 'test'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta: any = import.meta as unknown as { vitest?: unknown; env?: { MODE?: string } }
    return Boolean(meta?.vitest) || meta?.env?.MODE === 'test'
  } catch {
    return false
  }
})()

const shouldInitialize = browser && !isTestEnv

if (shouldInitialize) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  })

  isSupported()
    .then(supported => {
      if (supported && app) {
        analytics = getAnalytics(app)
      }
    })
    .catch(() => {
      // no-op when analytics are unsupported (e.g., server-side or certain browsers)
    })
}
