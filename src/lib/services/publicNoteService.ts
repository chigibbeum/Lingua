import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  Timestamp,
  type QueryConstraint,
  type DocumentData,
} from 'firebase/firestore'

import { db } from '../firebase/client'

import type { PublicNote } from '../schemas/note'

export type { PublicNote }

/**
 * List public notes from the top-level notes collection.
 * Optional filters can be added later (e.g., by type).
 */
export async function listPublicNotes(limitN = 20): Promise<PublicNote[]> {
  const constraints: QueryConstraint[] = [
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc'),
  ]
  const ref = collection(db, 'notes')
  const q = query(ref, ...constraints)
  const snap = await getDocs(q)
  const items: PublicNote[] = []
  snap.forEach(d => {
    const data = d.data() as DocumentData
    const createdValue = data.createdAt
    const created =
      createdValue instanceof Timestamp
        ? createdValue.toDate().toISOString()
        : typeof createdValue === 'string'
          ? createdValue
          : null
    // sentenceId is stored as a field in top-level notes collection
    const sentenceId = typeof data.sentenceId === 'string' ? data.sentenceId : null
    const item: PublicNote = {
      id: d.id,
      ownerUid: String(data.ownerUid ?? ''),
      sentenceId,
      type: data.type === 'grammar' ? 'grammar' : 'vocab',
      createdAt: created,
    }
    if (data.text !== undefined) item.text = String(data.text)
    if (data.target !== undefined) item.target = String(data.target)
    if (data.native !== undefined) item.native = String(data.native)
    items.push(item)
  })
  return items.slice(0, Math.max(0, limitN))
}
