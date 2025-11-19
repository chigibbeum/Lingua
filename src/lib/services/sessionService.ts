import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore'

import { db } from '../firebase'
import { auth } from '../firebase'
import { ensureUserDocument } from './userService'

import type { ParseSession } from '../stores/session'

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
  await setDoc(ref, payload, {
    merge: true,
  })
}

export async function loadSessions(): Promise<ParseSession[]> {
  const uid = requireUserId()
  const q = query(collection(db, 'users', uid, 'sessions'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  const sessions: ParseSession[] = []
  snap.forEach(d => {
    const data = d.data() as DocumentData
    // Normalize Firestore Timestamps back to ISO strings where applicable
    const normalize = (value: unknown): string | null => {
      if (value instanceof Timestamp) {
        return value.toDate().toISOString()
      }
      return typeof value === 'string' ? value : null
    }
    sessions.push({
      id: String(data.id ?? d.id),
      sentence: String(data.sentence ?? ''),
      morphemes: Array.isArray(data.morphemes) ? (data.morphemes as ParseSession['morphemes']) : [],
      nodes: Array.isArray(data.nodes) ? data.nodes : [],
      edges: Array.isArray(data.edges) ? data.edges : [],
      createdAt: normalize(data.createdAt) ?? '',
      lastReviewedAt: normalize(data.lastReviewedAt),
      completed: Boolean(data.completed),
      tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    })
  })
  return sessions
}
