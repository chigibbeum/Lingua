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
} from 'firebase/firestore'
import type { ParseSession } from '../stores/session'
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

export async function listVocabFlashcardsBySentenceText(sentenceText: string): Promise<Flashcard[]> {
  const uid = requireUserId()
  const base = collection(db, 'users', uid, 'flashcards')
  const q = query(base, where('type', '==', 'vocab'), where('sentenceText', '==', sentenceText))
  const snap = await getDocs(q)
  const items: Flashcard[] = []
  snap.forEach(d => {
    const data = d.data() as any
    const created =
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt ?? null
    items.push({
      id: d.id,
      type: (data.type ?? 'vocab'),
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

export async function createFlashcardsFromVocabNotes(notes: VocabFlashInput[]): Promise<number> {
  if (!notes?.length) return 0
  const uid = requireUserId()
  await ensureUserDocument(uid)
  const ref = collection(db, 'users', uid, 'flashcards')
  let created = 0

  // Prepare per-sentence duplicate prevention without persisting the sentence
  const bySentence = new Map<string, VocabFlashInput[]>()
  for (const n of notes) {
    const key = (n.sentenceText ?? '').trim()
    if (!key) continue
    if (!bySentence.has(key)) bySentence.set(key, [])
    bySentence.get(key)!.push(n)
  }
  const existingKeysByText = new Map<string, Set<string>>()
  const buildKey = (front?: string, back?: string) =>
    `${String(front ?? '').trim().toLowerCase()}||${String(back ?? '').trim().toLowerCase()}`

  for (const text of bySentence.keys()) {
    const existingForText = await listVocabFlashcardsBySentenceText(text)
    const keys = new Set<string>()
    for (const fc of existingForText) {
      keys.add(buildKey(fc.front, fc.back))
    }
    existingKeysByText.set(text, keys)
  }

  // Create flashcards; do not persist sentence if it doesn't already exist
  for (const n of notes) {
    const front = String(n.front ?? '').trim()
    const back = String(n.back ?? '').trim()
    if (!front || !back) continue
    const text = (n.sentenceText ?? '').trim()
    if (text && existingKeysByText.has(text)) {
      const existingKeys = existingKeysByText.get(text)!
      const key = buildKey(front, back)
      if (existingKeys.has(key)) continue
      existingKeys.add(key)
    }
    const cleanedSentenceId =
      n.sentenceId && !n.sentenceId.startsWith('s-') ? n.sentenceId : null
    await addDoc(ref, {
      type: 'vocab',
      front,
      back,
      sentenceText: n.sentenceText ?? null,
      morphemeText: n.morphemeText ?? null,
      sentenceId: cleanedSentenceId,
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
  const buildItems = (snap: any): Flashcard[] => {
    const items: Flashcard[] = []
    snap.forEach((d: any) => {
      const data = d.data() as any
      const created =
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : data.createdAt ?? null
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

  try {
    const q = type
      ? query(base, where('type', '==', type), orderBy('createdAt', 'desc'))
      : query(base, orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return buildItems(snap)
  } catch (err: any) {
    // Fallback for missing composite index: drop orderBy and sort client-side
    const message = String(err?.message ?? '').toLowerCase()
    const code = String(err?.code ?? '').toLowerCase()
    const needsIndex = code.includes('failed-precondition') || message.includes('index')
    if (!needsIndex) throw err

    const q = type ? query(base, where('type', '==', type)) : base
    const snap = await getDocs(q as any)
    const items = buildItems(snap)
    items.sort((a, b) => {
      const at = a.createdAt ? Date.parse(a.createdAt) : 0
      const bt = b.createdAt ? Date.parse(b.createdAt) : 0
      return bt - at
    })
    return items
  }
}


