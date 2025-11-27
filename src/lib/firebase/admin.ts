import type { Bucket } from '@google-cloud/storage'
import { initializeApp, applicationDefault, getApps, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

const sanitizeEnvValue = (value: string | undefined | null): string | undefined => {
  if (!value) return undefined

  let normalized = value.trim()
  normalized = normalized.replace(/,+$/, '')

  const hasMatchingQuotes =
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))

  if (hasMatchingQuotes) {
    normalized = normalized.slice(1, -1)
  }

  return normalized || undefined
}

const env = (key: string): string | undefined => sanitizeEnvValue(process.env[key])

// SvelteKit loads .env automatically; no dotenv needed

// Resolve environment strictly from process.env (works in SvelteKit server and scripts/tests)
const gcsUserUploadsBucket = env('GCS_USER_UPLOADS_BUCKET')
const gcsBrandingBucket = env('GCS_BRANDING_BUCKET')
const firebaseProjectId =
  env('FIREBASE_PROJECT_ID') ?? env('GOOGLE_CLOUD_PROJECT') ?? env('GCLOUD_PROJECT')

const missingAdminConfig: string[] = []
if (!firebaseProjectId) {
  missingAdminConfig.push('FIREBASE_PROJECT_ID (or GOOGLE_CLOUD_PROJECT)')
}
if (!gcsUserUploadsBucket) {
  missingAdminConfig.push('GCS_USER_UPLOADS_BUCKET')
}
if (!gcsBrandingBucket) {
  missingAdminConfig.push('GCS_BRANDING_BUCKET')
}

const hasAdminConfig = missingAdminConfig.length === 0
const isProdEnv = process.env.NODE_ENV === 'production'

export function initializeAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  const storageBucket = gcsUserUploadsBucket

  if (!storageBucket) {
    throw new Error(
      'GCS_USER_UPLOADS_BUCKET is required. Set it in Cloud Run (runtime) or your local .env.'
    )
  }

  if (!firebaseProjectId) {
    throw new Error(
      'FIREBASE_PROJECT_ID (or GOOGLE_CLOUD_PROJECT) is required for Firebase Admin. Set FIREBASE_PROJECT_ID in your local .env to match the client project.'
    )
  }

  // Ensure downstream Google libraries and Admin SDK resolve the intended project
  process.env.GOOGLE_CLOUD_PROJECT = firebaseProjectId
  process.env.GCLOUD_PROJECT = firebaseProjectId
  if (!process.env.FIREBASE_CONFIG) {
    process.env.FIREBASE_CONFIG = JSON.stringify({
      projectId: firebaseProjectId,
    })
  }

  if (process.env.DEBUG_AUTH === '1') {
    console.warn('admin_env_resolve', {
      firebaseProjectId,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
      GCLOUD_PROJECT: process.env.GCLOUD_PROJECT,
    })
    console.warn('admin_bucket_resolve', {
      GCS_USER_UPLOADS_BUCKET: gcsUserUploadsBucket,
      GCS_BRANDING_BUCKET: gcsBrandingBucket,
    })
  }

  // ADC-only initialization (Cloud Run, or local via `gcloud auth application-default login`).
  try {
    console.warn('🔐 Using Application Default Credentials for Firebase Admin')
    return initializeApp({
      credential: applicationDefault(),
      projectId: firebaseProjectId,
      storageBucket,
    })
  } catch {
    throw new Error(
      'ADC not available. For local dev, run "gcloud auth application-default login".'
    )
  }
}

// Avoid initializing during SvelteKit build/postbuild analysis to prevent env check failures.
// Force initialization when running staging E2E tests.
const isBuildPhase =
  process.env.STAGING_E2E === '1' ? false : process.env.SKIP_FIREBASE_ADMIN_INIT === '1'

const shouldInitAdmin = !isBuildPhase && hasAdminConfig

if (!hasAdminConfig && !isBuildPhase) {
  const guidance = `[firebase-admin] Missing required env vars: ${missingAdminConfig.join(
    ', '
  )}. See documentation/agent-guidelines/FirebaseSDKGuidelines.md for setup instructions.`
  if (isProdEnv) {
    throw new Error(guidance)
  }
  console.warn(`${guidance} Skipping Firebase Admin initialization for this run.`)
}

let adminAuthRef: Auth | undefined
let adminDbRef: Firestore | undefined
let adminBucketRef: Bucket | undefined
let brandingBucketRef: Bucket | undefined

if (shouldInitAdmin) {
  const firebaseAdminApp = initializeAdminApp()
  adminAuthRef = getAuth(firebaseAdminApp)
  adminDbRef = getFirestore(firebaseAdminApp)
  adminBucketRef = getStorage(firebaseAdminApp).bucket()

  // Dedicated public branding bucket (Uniform access + allUsers object viewer via IAM)
  const brandingBucketName = gcsBrandingBucket!
  brandingBucketRef = getStorage(firebaseAdminApp).bucket(brandingBucketName)
} else if (!isBuildPhase) {
  console.warn(
    '[firebase-admin] Admin SDK remains disabled because configuration is incomplete. Auth/session verification will fall back to client tokens.'
  )
}

export const adminAuth: Auth | null = adminAuthRef ?? null
export const adminDb: Firestore | null = adminDbRef ?? null
export const adminBucket: Bucket | null = adminBucketRef ?? null
export const brandingBucket: Bucket | null = brandingBucketRef ?? null
