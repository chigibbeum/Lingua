import { initializeApp, getApp, getApps } from 'firebase/app'
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAIjTG87XPUJOosJfiys567x6umBIkVCmQ',
  authDomain: 'parse-8e807.firebaseapp.com',
  projectId: 'parse-8e807',
  storageBucket: 'parse-8e807.firebasestorage.app',
  messagingSenderId: '334219656849',
  appId: '1:334219656849:web:554f2dbe88d64820bf8930',
  measurementId: 'G-9VC1KGM745',
}

// Initialize Firebase (guard against re-initialization in HMR)
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// Initialize Analytics only in supported browser environments
export let analytics: Analytics | undefined
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
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
  useFetchStreams: false,
  // If issues persist on your network, you can also force long polling:
  // experimentalForceLongPolling: true,
})


