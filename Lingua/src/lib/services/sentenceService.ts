import { db, auth } from '../firebase'
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { ensureUserDocument } from './userService'

export interface SentenceDoc {
  id: string
  text: string
  createdAt: string | null
}

export interface SentenceNote {
  id: string
  type: 'vocab' | 'grammar'
  text?: string
  target?: string
  native?: string
  visibility?: 'public' | 'private'
  createdAt: string | null
}

export type SentenceNoteInput =
  | { type: 'vocab'; target: string; native: string; morphemeText?: string }
  | { type: 'grammar'; text: string; morphemeText?: string }

function requireUserId(): string {
  const current = auth.currentUser
  if (!current?.uid) {
    throw new Error('Not authenticated')
  }
  return current.uid
}

export async function saveSentence(text: string): Promise<string> {
  const trimmed = (text ?? '').trim()
  if (!trimmed) {
    throw new Error('Cannot save empty sentence')
  }
  const uid = requireUserId()
  await ensureUserDocument(uid)
  const ref = collection(db, 'users', uid, 'sentences')
  const docRef = await addDoc(ref, {
    text: trimmed,
    ownerUid: uid,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function listSentences(): Promise<SentenceDoc[]> {
  const uid = requireUserId()
  const ref = collection(db, 'users', uid, 'sentences')
  const q = query(ref, orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  const items: SentenceDoc[] = []
  snap.forEach(d => {
    const data = d.data() as any
    const created = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : (data.createdAt ?? null)
    items.push({ id: d.id, text: String(data.text ?? ''), createdAt: created })
  })
  return items
}

export async function listSentenceNotes(sentenceId: string): Promise<SentenceNote[]> {
  const uid = requireUserId()
  const ref = collection(db, 'users', uid, 'sentences', sentenceId, 'notes')
  const q = query(ref, orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  const items: SentenceNote[] = []
  snap.forEach(d => {
    const data = d.data() as any
    const created = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : (data.createdAt ?? null)
    const item: SentenceNote = {
      id: d.id,
      type: (data.type ?? 'vocab'),
      createdAt: created,
    }
    if (data.text !== undefined) item.text = String(data.text)
    if (data.target !== undefined) item.target = String(data.target)
    if (data.native !== undefined) item.native = String(data.native)
    items.push(item)
  })
  return items
}

export async function saveSentenceNotes(
  sentenceId: string,
  notes: SentenceNoteInput[],
  visibility: 'public' | 'private' = 'private'
): Promise<number> {
  const uid = requireUserId()
  await ensureUserDocument(uid)
  if (!notes?.length) return 0
  const ref = collection(db, 'users', uid, 'sentences', sentenceId, 'notes')
  let saved = 0
  for (const n of notes) {
    const payload: any = {
      type: n.type,
      ownerUid: uid,
      visibility,
      createdAt: serverTimestamp(),
    }
    if (n.type === 'vocab') {
      payload.target = n.target
      payload.native = n.native
    } else {
      payload.text = n.text
    }
    if ('morphemeText' in n && n.morphemeText) {
      payload.morphemeText = n.morphemeText
    }
    await addDoc(ref, payload)
    saved += 1
  }
  return saved
}

export async function saveSentenceWithNotes(text: string, notes: SentenceNoteInput[]): Promise<string> {
  const id = await saveSentence(text)
  await saveSentenceNotes(id, notes)
  return id
}


