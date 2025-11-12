import { db, auth } from '../firebase'
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  doc,
  writeBatch,
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
  pos?: string
  visibility?: 'public' | 'private'
  morphemeText?: string
  createdAt: string | null
}

export type SentenceNoteInput =
  | { type: 'vocab'; target: string; native: string; pos?: string; morphemeText?: string }
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
    if (data.pos !== undefined) item.pos = String(data.pos)
    if (data.morphemeText !== undefined) item.morphemeText = String(data.morphemeText)
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
      if (n.pos) payload.pos = n.pos
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

export async function updateSentence(
  sentenceId: string,
  changes: { text?: string }
): Promise<void> {
  const uid = requireUserId()
  if (!sentenceId) {
    throw new Error('sentenceId is required')
  }

  const payload: any = {}
  if (changes.text !== undefined) {
    const trimmed = (changes.text ?? '').trim()
    if (!trimmed) {
      throw new Error('Sentence text cannot be empty')
    }
    payload.text = trimmed
  }

  if (Object.keys(payload).length === 0) {
    return
  }

  const ref = doc(db, 'users', uid, 'sentences', sentenceId)
  await updateDoc(ref, payload)
}

export async function deleteSentence(sentenceId: string): Promise<void> {
  const uid = requireUserId()
  if (!sentenceId) {
    throw new Error('sentenceId is required')
  }
  // Collect all notes under the sentence and delete them with the sentence in a batch
  const notesRef = collection(db, 'users', uid, 'sentences', sentenceId, 'notes')
  const notesSnap = await getDocs(notesRef)
  const sentenceRef = doc(db, 'users', uid, 'sentences', sentenceId)
  const batch = writeBatch(db)
  notesSnap.forEach(d => {
    batch.delete(d.ref)
  })
  batch.delete(sentenceRef)
  await batch.commit()
}


