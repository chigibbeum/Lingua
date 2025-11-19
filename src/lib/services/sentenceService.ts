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
  where,
  type DocumentData,
} from 'firebase/firestore'

import { db, auth } from '../firebase'
import { ensureUserDocument } from './userService'

import type { SentenceDoc, SentenceNote, SentenceNoteInput } from '../schemas/sentence'

export type { SentenceDoc, SentenceNote, SentenceNoteInput }

function resolveCreatedAt(value: unknown): string | null {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }
  return typeof value === 'string' ? value : null
}

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
  const ref = collection(db, 'sentences')
  const docRef = await addDoc(ref, {
    text: trimmed,
    ownerUid: uid,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function listSentences(): Promise<SentenceDoc[]> {
  const uid = requireUserId()
  const ref = collection(db, 'sentences')
  const q = query(ref, where('ownerUid', '==', uid), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  const items: SentenceDoc[] = []
  snap.forEach(d => {
    const data = d.data() as DocumentData
    const created = resolveCreatedAt(data.createdAt)
    items.push({
      id: d.id,
      text: String(data.text ?? ''),
      createdAt: created,
    })
  })
  return items
}

export async function listSentenceNotes(sentenceId: string): Promise<SentenceNote[]> {
  requireUserId() // Ensure auth
  const ref = collection(db, 'notes')
  // Notes are just filtered by sentenceId (and we rely on rules/logic that sentenceId implies ownership if strict)
  // Or we can add ownerUid here too if we want strictly own notes.
  // Assuming sentenceId is enough context for now, but typically we'd want ownerUid too for security rules alignment
  // adding ownerUid makes it easier to secure.
  const uid = requireUserId()
  const q = query(
    ref,
    where('sentenceId', '==', sentenceId),
    where('ownerUid', '==', uid),
    orderBy('createdAt', 'desc')
  )
  
  // Fallback if composite index fails or simple query is needed
  // However, let's try the correct composite one first.
  
  try {
    const snap = await getDocs(q)
    const items: SentenceNote[] = []
    snap.forEach(d => {
      const data = d.data() as DocumentData
      const created = resolveCreatedAt(data.createdAt)
      const item: SentenceNote = {
        id: d.id,
        type: data.type ?? 'vocab',
        createdAt: created,
      }
      if (data.text !== undefined) item.text = String(data.text)
      if (data.target !== undefined) item.target = String(data.target)
      if (data.native !== undefined) item.native = String(data.native)
      if (data.pos !== undefined) item.pos = String(data.pos)
      if (data.morphemeText !== undefined) item.morphemeText = String(data.morphemeText)
      if (Array.isArray(data.tags)) item.tags = (data.tags as unknown[]).map(String)
      items.push(item)
    })
    return items
  } catch (e) {
      // If index is missing, fall back to client side sort or just standard query
      console.error("Index missing for notes query, falling back", e)
      // For now, throw to alert user to create index
      throw e
  }
}

export async function saveSentenceNotes(
  sentenceId: string,
  notes: SentenceNoteInput[],
  visibility: 'public' | 'private' = 'private'
): Promise<number> {
  const uid = requireUserId()
  await ensureUserDocument(uid)
  if (!notes?.length) return 0
  const ref = collection(db, 'notes')
  let saved = 0
  for (const n of notes) {
    const payload: Record<string, unknown> = {
      type: n.type,
      ownerUid: uid,
      sentenceId,
      visibility,
      createdAt: serverTimestamp(),
    }
    if (n.type === 'vocab') {
      payload.target = n.target
      payload.native = n.native
      if (n.pos) payload.pos = n.pos
      if (n.tags && n.tags.length) payload.tags = n.tags
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

export async function saveSentenceWithNotes(
  text: string,
  notes: SentenceNoteInput[]
): Promise<string> {
  const id = await saveSentence(text)
  await saveSentenceNotes(id, notes)
  return id
}

export async function updateSentence(
  sentenceId: string,
  changes: { text?: string }
): Promise<void> {
  const uid = requireUserId() // check auth
  if (!sentenceId) {
    throw new Error('sentenceId is required')
  }

  const payload: { text?: string } = {
  }
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

  const ref = doc(db, 'sentences', sentenceId)
  await updateDoc(ref, payload)
}

export async function deleteSentence(sentenceId: string): Promise<void> {
  const uid = requireUserId()
  if (!sentenceId) {
    throw new Error('sentenceId is required')
  }
  // Collect all notes under the sentence and delete them with the sentence in a batch
  const notesRef = collection(db, 'notes')
  // Query notes by sentenceId
  const q = query(notesRef, where('sentenceId', '==', sentenceId))
  const notesSnap = await getDocs(q)
  
  const sentenceRef = doc(db, 'sentences', sentenceId)
  const batch = writeBatch(db)
  notesSnap.forEach(d => {
    // Ensure we only delete if it belongs to the user (extra safety, though query should be sufficient if secured)
    // For now assume client trusted for own data or rules enforce it
    batch.delete(d.ref)
  })
  batch.delete(sentenceRef)
  await batch.commit()
}
