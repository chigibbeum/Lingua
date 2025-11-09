import { writable, derived } from 'svelte/store'
import { auth } from '../firebase'
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

// Primary user store
export const user = writable<User | null>(null)

// Derived stores
export const userId = derived(user, u => (u ? u.uid : null))
export const isLoggedIn = derived(user, u => Boolean(u && u.uid))

let initialized = false
function initAuthListener() {
  if (initialized) return
  initialized = true
  onAuthStateChanged(auth, current => {
    user.set(current)
  })
}

initAuthListener()

export async function choosePersistence(rememberMe: boolean): Promise<void> {
  const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence
  await setPersistence(auth, persistence)
}

export async function loginWithGoogle(rememberMe = true): Promise<void> {
  await choosePersistence(rememberMe)
  const provider = new GoogleAuthProvider()
  await signInWithPopup(auth, provider)
}

export async function loginWithEmailPassword(email: string, password: string, rememberMe = true): Promise<void> {
  await choosePersistence(rememberMe)
  await signInWithEmailAndPassword(auth, email, password)
}

export async function signupWithEmailPassword(email: string, password: string, rememberMe = true): Promise<void> {
  await choosePersistence(rememberMe)
  await createUserWithEmailAndPassword(auth, email, password)
}

export async function logout(): Promise<void> {
  await signOut(auth)
}


