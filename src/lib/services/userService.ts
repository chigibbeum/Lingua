import { updateProfile, type User as FirebaseUser } from 'firebase/auth'
import {
  doc,
  setDoc,
  runTransaction,
  getDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore'

import { auth, db } from '../firebase'
import { user as authUserStore } from '../stores/auth'

function normalizeUsername(raw: string): string {
  const trimmed = String(raw ?? '')
    .trim()
    .toLowerCase()
  if (!trimmed) throw new Error('Username required.')
  if (trimmed.length < 3 || trimmed.length > 20)
    throw new Error('Username must be 3–20 characters.')
  if (!/^[a-z0-9_]+$/.test(trimmed)) throw new Error('Use letters, numbers or underscore only.')
  return trimmed
}

async function syncAuthDisplayName(currentUser: FirebaseUser, username: string): Promise<void> {
  try {
    await updateProfile(currentUser, {
      displayName: username,
    })
    // Ensure Svelte store re-renders by setting the updated currentUser reference
    authUserStore.set(auth.currentUser)
  } catch {
    // non-fatal if profile sync fails
  }
}

export async function setUsername(raw: string): Promise<void> {
  const currentUser = auth.currentUser
  if (!currentUser) throw new Error('No user signed in.')
  const username = normalizeUsername(raw)

  const userRef = doc(db, 'users', currentUser.uid)
  await setDoc(
    userRef,
    {
      username,
    },
    {
      merge: true,
    }
  )
  await syncAuthDisplayName(currentUser, username)
}

export async function ensureUserDocument(uid?: string): Promise<void> {
  const id = uid ?? auth.currentUser?.uid
  if (!id) throw new Error('Not authenticated')
  const userRef = doc(db, 'users', id)
  const snap = await getDoc(userRef)
  if (!snap.exists()) {
    await setDoc(
      userRef,
      {
        createdAt: serverTimestamp(),
      },
      {
        merge: true,
      }
    )
  }
}

export async function claimUsername(raw: string): Promise<void> {
  const currentUser = auth.currentUser
  if (!currentUser) throw new Error('No user signed in.')
  const username = normalizeUsername(raw)

  const usernameRef = doc(db, 'usernames', username)
  const userRef = doc(db, 'users', currentUser.uid)

  await runTransaction(db as Firestore, async tx => {
    const takenSnap = await tx.get(usernameRef)
    if (takenSnap.exists()) {
      throw new Error('Username taken.')
    }
    tx.set(usernameRef, {
      ownerUid: currentUser.uid,
      createdAt: Date.now(),
    })
    tx.set(
      userRef,
      {
        username,
      },
      {
        merge: true,
      }
    )
  })

  await syncAuthDisplayName(currentUser, username)
}

export async function getUsername(): Promise<string | null> {
  const currentUser = auth.currentUser
  if (!currentUser) {
    console.warn('No user signed in.')
    return null
  }

  const userRef = doc(db, 'users', currentUser.uid)
  const snap = await getDoc(userRef)
  if (snap.exists()) {
    const data = snap.data() as { username?: string }
    return data?.username ?? 'Anonymous'
  } else {
    console.warn('No such user profile document!')
    return 'Anonymous'
  }
}

export async function setProfileDetails(details: {
  firstName?: string
  lastName?: string
}): Promise<void> {
  const currentUser = auth.currentUser
  if (!currentUser) throw new Error('No user signed in.')
  const safeFirst = (details.firstName ?? '').trim()
  const safeLast = (details.lastName ?? '').trim()
  const payload: Record<string, string> = {
}
  if (safeFirst) payload.firstName = safeFirst
  if (safeLast) payload.lastName = safeLast
  if (Object.keys(payload).length === 0) return
  const userRef = doc(db, 'users', currentUser.uid)
  await setDoc(userRef, payload, {
    merge: true,
  })
}

export async function getProfileDetails(): Promise<{ firstName?: string; lastName?: string }> {
  const currentUser = auth.currentUser
  if (!currentUser) throw new Error('No user signed in.')
  const userRef = doc(db, 'users', currentUser.uid)
  const snap = await getDoc(userRef)
  if (!snap.exists()) return {
}
  const data = snap.data() as { firstName?: string; lastName?: string }
  const first = (data.firstName ?? '').trim()
  const last = (data.lastName ?? '').trim()
  const result: { firstName?: string; lastName?: string } = {
}
  if (first) result.firstName = first
  if (last) result.lastName = last
  return result
}
