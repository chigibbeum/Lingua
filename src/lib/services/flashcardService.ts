import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
  type DocumentData,
  type QuerySnapshot,
} from 'firebase/firestore'

import { db } from '../firebase/client'
import { ensureUserDocument } from './userService'
import { requireUserId } from './authUtils'

import type { ParseSession } from '../stores/session'
import type { Flashcard, VocabFlashInput, FlashcardDoc } from '../schemas/flashcard'

export type { Flashcard, VocabFlashInput, FlashcardDoc }

export async function createFlashcardsFromSession(session: ParseSession): Promise<number> {
  if (!session) return 0
  const uid = requireUserId()
  await ensureUserDocument(uid)
  const ref = collection(db, 'flashcards')
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
          ...(note.pos ? { pos: note.pos } : {}),
          ...(Array.isArray(note.tags) && note.tags.length ? { tags: note.tags } : {}),
          ownerUid: uid,
          createdAt: serverTimestamp(),
        })
        created++
      }
    }
  }
  return created
}

function resolveCreatedAt(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }
  return typeof value === 'string' ? value : ''
}

function optionalString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number' || typeof value === 'bigint' || typeof value === 'boolean') {
    return String(value)
  }
  return undefined
}

export async function listVocabFlashcardsBySentenceText(
  sentenceText: string
): Promise<Flashcard[]> {
  const uid = requireUserId()
  const base = collection(db, 'flashcards')
  const q = query(
    base,
    where('ownerUid', '==', uid),
    where('type', '==', 'vocab'),
    where('sentenceText', '==', sentenceText)
  )
  const snap = await getDocs(q)
  const items: Flashcard[] = []
  snap.forEach(d => {
    const data = d.data() as FlashcardDoc
    const created = resolveCreatedAt(data.createdAt ?? '')
    items.push({
      id: d.id,
      type: data.type ?? 'vocab',
      front: String(data.front ?? ''),
      back: String(data.back ?? ''),
      sentenceText: optionalString(data.sentenceText),
      morphemeText: optionalString(data.morphemeText),
      sentenceId: optionalString(data.sentenceId),
      morphemeId: optionalString(data.morphemeId),
      createdAt: created,
    })
  })
  return items
}

export async function createFlashcardsFromVocabNotes(notes: VocabFlashInput[]): Promise<number> {
  if (!notes?.length) return 0
  const uid = requireUserId()
  await ensureUserDocument(uid)
  const ref = collection(db, 'flashcards')
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
    `${String(front ?? '')
      .trim()
      .toLowerCase()}||${String(back ?? '')
      .trim()
      .toLowerCase()}`

  for (const text of bySentence.keys()) {
    const existingForText = await listVocabFlashcardsBySentenceText(text)
    const keys = new Set<string>()
    for (const fc of existingForText) {
      keys.add(buildKey(fc.front, fc.back))
    }
    existingKeysByText.set(text, keys)
  }

  // Build global dedupe set (front/back across all vocab flashcards)
  const existingGlobal = await listFlashcards('vocab')
  const globalKeys = new Set<string>()
  for (const fc of existingGlobal) {
    globalKeys.add(buildKey(fc.front, fc.back))
  }

  // Create flashcards; do not persist sentence if it doesn't already exist
  for (const n of notes) {
    const front = String(n.front ?? '').trim()
    const back = String(n.back ?? '').trim()
    if (!front || !back) continue
    const pairKey = buildKey(front, back)

    // Global dedupe: skip if this front/back already exists anywhere
    if (globalKeys.has(pairKey)) continue
    globalKeys.add(pairKey)

    const text = (n.sentenceText ?? '').trim()
    if (text && existingKeysByText.has(text)) {
      const existingKeys = existingKeysByText.get(text)!
      if (existingKeys.has(pairKey)) continue
      existingKeys.add(pairKey)
    }
    const cleanedSentenceId = n.sentenceId && !n.sentenceId.startsWith('s-') ? n.sentenceId : null
    await addDoc(ref, {
      type: 'vocab',
      front,
      back,
      sentenceText: n.sentenceText ?? null,
      morphemeText: n.morphemeText ?? null,
      sentenceId: cleanedSentenceId,
      morphemeId: n.morphemeId ?? null,
      ...(n.pos ? { pos: n.pos } : {}),
      ...(Array.isArray(n.tags) && n.tags.length ? { tags: n.tags } : {}),
      ownerUid: uid,
      createdAt: serverTimestamp(),
    })
    created++
  }
  return created
}

export async function listFlashcards(type?: 'vocab' | 'grammar'): Promise<Flashcard[]> {
  const uid = requireUserId()
  const base = collection(db, 'flashcards')
  const buildItems = (snap: QuerySnapshot<DocumentData>): Flashcard[] => {
    const items: Flashcard[] = []
    snap.forEach(d => {
      const data = d.data() as FlashcardDoc
      const created = resolveCreatedAt(data.createdAt ?? '')
      items.push({
        id: d.id,
        type: (data.type ?? 'vocab') as 'vocab' | 'grammar',
        front: String(data.front ?? ''),
        back: String(data.back ?? ''),
        sentenceText: optionalString(data.sentenceText),
        morphemeText: optionalString(data.morphemeText),
        sentenceId: optionalString(data.sentenceId),
        morphemeId: optionalString(data.morphemeId),
        createdAt: created,
        ...(data.pos !== undefined
          ? {
              pos: String(data.pos),
            }
          : {}),
        ...(Array.isArray(data.tags)
          ? {
              tags: (data.tags as unknown[]).map(String),
            }
          : {}),
      })
    })
    return items
  }

  try {
    const q = type
      ? query(
          base,
          where('ownerUid', '==', uid),
          where('type', '==', type),
          orderBy('createdAt', 'desc')
        )
      : query(base, where('ownerUid', '==', uid), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return buildItems(snap)
  } catch (caught: unknown) {
    // Fallback for missing composite index: drop orderBy and sort client-side
    const message =
      caught && typeof caught === 'object' && 'message' in caught
        ? String((caught as { message?: unknown }).message ?? '').toLowerCase()
        : ''
    const code =
      caught && typeof caught === 'object' && 'code' in caught
        ? String((caught as { code?: unknown }).code ?? '').toLowerCase()
        : ''
    const needsIndex = code.includes('failed-precondition') || message.includes('index')
    if (!needsIndex) throw caught

    const q = type
      ? query(base, where('ownerUid', '==', uid), where('type', '==', type))
      : query(base, where('ownerUid', '==', uid))
    const snap = await getDocs(q)
    const items = buildItems(snap)
    items.sort((a, b) => {
      const at = a.createdAt ? Date.parse(a.createdAt) : 0
      const bt = b.createdAt ? Date.parse(b.createdAt) : 0
      return bt - at
    })
    return items
  }
}
