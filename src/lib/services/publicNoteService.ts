import {
  collectionGroup,
  getDocs,
  orderBy,
  query,
  where,
  Timestamp,
  type QueryConstraint,
  type DocumentData,
} from 'firebase/firestore'

import { db } from '../firebase'

export type PublicNote = {
  id: string
  ownerUid: string
  sentenceId: string | null
  type: 'vocab' | 'grammar'
  text?: string
  target?: string
  native?: string
  createdAt: string | null
}

/**
 * List public notes across all users using a collection group query.
 * Optional filters can be added later (e.g., by type).
 */
export async function listPublicNotes(limitN = 20): Promise<PublicNote[]> {
  const constraints: QueryConstraint[] = [
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc'),
    // Firestore will prompt for an index if needed
  ]
  const cg = collectionGroup(db, 'notes')
  const q = query(cg, ...constraints)
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
    const sentenceId = d.ref.parent?.parent?.id ?? null
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
