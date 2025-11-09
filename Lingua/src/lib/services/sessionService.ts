import { db } from '../firebase'
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore'
import type { ParseSession } from '../stores/session'
import { auth } from '../firebase'
import { ensureUserDocument } from './userService'

function requireUserId(): string {
  const current = auth.currentUser
  if (!current?.uid) {
    throw new Error('Not authenticated')
  }
  return current.uid
}

export async function saveSession(session: ParseSession): Promise<void> {
  const uid = requireUserId()
  await ensureUserDocument(uid)
  const ref = doc(db, 'users', uid, 'sessions', session.id)
  const payload = {
    ...session,
    ownerUid: uid,
    updatedAt: serverTimestamp(),
  }
  await setDoc(ref, payload, { merge: true })
}

export async function loadSessions(): Promise<ParseSession[]> {
  const uid = requireUserId()
  const q = query(collection(db, 'users', uid, 'sessions'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  const sessions: ParseSession[] = []
  snap.forEach(d => {
    const data = d.data() as any
    // Normalize Firestore Timestamps back to ISO strings where applicable
    const normalize = (value: any) => (value instanceof Timestamp ? value.toDate().toISOString() : value)
    sessions.push({
      id: data.id,
      sentence: data.sentence,
      morphemes: data.morphemes,
      nodes: data.nodes,
      edges: data.edges,
      createdAt: normalize(data.createdAt),
      lastReviewedAt: normalize(data.lastReviewedAt) ?? null,
      completed: Boolean(data.completed),
      tags: Array.isArray(data.tags) ? data.tags : [],
    })
  })
  return sessions
}


