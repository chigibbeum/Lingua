import { browser } from '$app/environment'
import { writable, derived } from 'svelte/store'
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'

import { auth } from '../firebase/client'

// Primary user store
export const user = writable<User | null>(null)

// Derived stores
export const userId = derived(user, u => (u ? u.uid : null))
export const isLoggedIn = derived(user, u => Boolean(u && u.uid))
export const authReady = writable(false)

let initialized = false
function initAuthListener() {
  if (initialized || !browser || !auth) return
  initialized = true
  onAuthStateChanged(auth, async current => {
    console.log('[auth] onAuthStateChanged fired', current ? 'with user' : 'no user')
    const start = performance.now()
    // Reset authReady while we sync the session - prevents premature redirects
    authReady.set(false)
    user.set(current)
    try {
      await syncServerSession(current)
      console.log(
        '[auth] syncServerSession completed in',
        Math.round(performance.now() - start),
        'ms'
      )
    } catch (err) {
      console.warn('[auth] Failed to sync server session', err)
    }
    authReady.set(true)
    console.log('[auth] authReady set to true')
  })
}

if (browser) {
  initAuthListener()
}

async function syncServerSession(current: User | null): Promise<void> {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') return
  try {
    if (current) {
      const t1 = performance.now()
      const idToken = await current.getIdToken()
      console.log('[auth] getIdToken took', Math.round(performance.now() - t1), 'ms')
      const t2 = performance.now()
      await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      })
      console.log('[auth] POST /api/session took', Math.round(performance.now() - t2), 'ms')
    } else {
      await fetch('/api/session', {
        method: 'DELETE',
        credentials: 'include',
      })
    }
  } catch (error) {
    throw error
  }
}

export async function choosePersistence(rememberMe: boolean): Promise<void> {
  const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence
  await setPersistence(auth, persistence)
}

export async function loginWithGoogle(rememberMe = true): Promise<void> {
  await choosePersistence(rememberMe)
  const provider = new GoogleAuthProvider()
  await signInWithPopup(auth, provider)
}

export async function loginWithEmailPassword(
  email: string,
  password: string,
  rememberMe = true
): Promise<void> {
  await choosePersistence(rememberMe)
  await signInWithEmailAndPassword(auth, email, password)
}

export async function signupWithEmailPassword(
  email: string,
  password: string,
  rememberMe = true
): Promise<void> {
  await choosePersistence(rememberMe)
  await createUserWithEmailAndPassword(auth, email, password)
}

export async function logout(): Promise<void> {
  await signOut(auth)
}
