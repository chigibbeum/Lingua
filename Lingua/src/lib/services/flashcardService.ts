import { db, auth } from '../firebase'
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
  limit,
} from 'firebase/firestore'
import type { ParseSession } from '../stores/session'
import { saveSentenceNotes, saveSentenceWithNotes } from './sentenceService'
import { ensureUserDocument } from './userService'

export type Flashcard = {
  id: string
  type: 'vocab' | 'grammar'
  front: string // target
  back: string // native
  sentenceText?: string
  morphemeText?: string
  sentenceId?: string
  morphemeId?: string
  createdAt: string
}

function requireUserId(): string {
  const current = auth.currentUser
  if (!current?.uid) {
    throw new Error('Not authenticated')
  }
  return current.uid
}

export async function createFlashcardsFromSession(session: ParseSession): Promise<number> {
  if (!session) return 0
  const uid = requireUserId()
  await ensureUserDocument(uid)
  const ref = collection(db, 'users', uid, 'flashcards')
  let created = 0
  for (const m of session.morphemes) {
    for (const note of m.notes) {
      if (note.type === 'vocab') {
        await addDoc(ref, {
          type: 'vocab',
          front: note.target,
          back: note.native,
          sentenceText: session.sentence,
          morphemeText: m.text,
          sentenceId: session.id,
          morphemeId: m.id,
          ownerUid: uid,
          createdAt: serverTimestamp(),
        })
        created++
      }
    }
  }
  return created
}

export type VocabFlashInput = {
  front: string
  back: string
  sentenceText?: string
  morphemeText?: string
  sentenceId?: string
  morphemeId?: string
}

export async function createFlashcardsFromVocabNotes(notes: VocabFlashInput[]): Promise<number> {
  if (!notes?.length) return 0
  const uid = requireUserId()
  await ensureUserDocument(uid)
  const ref = collection(db, 'users', uid, 'flashcards')
  let created = 0

  // Ensure sentence and notes are persisted for any session-only selections
  // Group by sentenceText to minimize queries
  const bySentence = new Map<string, VocabFlashInput[]>()
  for (const n of notes) {
    const key = (n.sentenceText ?? '').trim()
    if (!key) continue
    if (!bySentence.has(key)) bySentence.set(key, [])
    bySentence.get(key)!.push(n)
  }

  // Map from sentenceText -> ensured Firestore sentenceId
  const ensuredIdByText = new Map<string, string>()

  for (const [text, group] of bySentence.entries()) {
    // If any item in the group lacks a Firestore sentenceId or has a session id (starts with 's-'), ensure persistence
    const needsEnsure = group.some(g => !g.sentenceId || g.sentenceId.startsWith('s-'))
    if (!needsEnsure) continue

    const noteInputs = group.map(g => ({
      type: 'vocab' as const,
      target: String(g.front ?? ''),
      native: String(g.back ?? ''),
      ...(g.morphemeText ? { morphemeText: g.morphemeText } : {}),
    }))

    // Try to find existing sentence by exact text; if not found, create with notes
    const base = collection(db, 'users', uid, 'sentences')
    const q = query(base, where('text', '==', text), limit(1))
    const snap = await getDocs(q)
    if (!snap.empty) {
      const doc = snap.docs[0]!
      const sentenceId = doc.id
      await saveSentenceNotes(sentenceId, noteInputs)
      ensuredIdByText.set(text, sentenceId)
    } else {
      const sentenceId = await saveSentenceWithNotes(text, noteInputs)
      ensuredIdByText.set(text, sentenceId)
    }
  }

  // Create flashcards with updated sentenceId, when available
  for (const n of notes) {
    const front = String(n.front ?? '').trim()
    const back = String(n.back ?? '').trim()
    if (!front || !back) continue
    const ensuredId = n.sentenceText ? ensuredIdByText.get(n.sentenceText) : undefined
    await addDoc(ref, {
      type: 'vocab',
      front,
      back,
      sentenceText: n.sentenceText ?? null,
      morphemeText: n.morphemeText ?? null,
      sentenceId: ensuredId ?? n.sentenceId ?? null,
      morphemeId: n.morphemeId ?? null,
      ownerUid: uid,
      createdAt: serverTimestamp(),
    })
    created++
  }
  return created
}

export async function listFlashcards(type?: 'vocab' | 'grammar'): Promise<Flashcard[]> {
  const uid = requireUserId()
  const base = collection(db, 'users', uid, 'flashcards')
  const q = type
    ? query(base, where('type', '==', type), orderBy('createdAt', 'desc'))
    : query(base, orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  const items: Flashcard[] = []
  snap.forEach(d => {
    const data = d.data() as any
    const created = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : (data.createdAt ?? null)
    items.push({
      id: d.id,
      type: (data.type ?? 'vocab') as 'vocab' | 'grammar',
      front: String(data.front ?? ''),
      back: String(data.back ?? ''),
      sentenceText: data.sentenceText ?? undefined,
      morphemeText: data.morphemeText ?? undefined,
      sentenceId: data.sentenceId ?? undefined,
      morphemeId: data.morphemeId ?? undefined,
      createdAt: created,
    })
  })
  return items
}


