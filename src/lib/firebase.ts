import { initializeApp, getApp, getApps } from 'firebase/app'
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'
import { firebaseClientConfig } from './config/firebaseClient'

// Initialize Firebase (guard against re-initialization in HMR)
export const app = getApps().length ? getApp() : initializeApp(firebaseClientConfig)

// Initialize Analytics only in supported browser environments
export let analytics: Analytics | undefined
if (typeof window !== 'undefined') {
  isSupported()
    .then(supported => {
      if (supported) {
        analytics = getAnalytics(app)
      }
    })
    .catch(() => {
      // no-op if analytics not supported (e.g., in some browsers or environments)
    })
}

export default app

// Export Firebase services
export const auth = getAuth(app)
export const db = initializeFirestore(app, {
  // Helps avoid WebChannel stream teardown 400s in certain environments
  experimentalAutoDetectLongPolling: true,
  // If issues persist on your network, you can also force long polling:
  // experimentalForceLongPolling: true,
})
