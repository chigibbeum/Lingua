import {
  listSentences,
  listSentenceNotes,
  type SentenceDoc,
  type SentenceNote,
} from './sentenceService'

import type { RecentVocabNote } from '../schemas/note'

export type { RecentVocabNote }

export async function listRecentVocabNotes(limitN = 7): Promise<RecentVocabNote[]> {
  const sentences: SentenceDoc[] = await listSentences()
  const all: RecentVocabNote[] = []
  for (const s of sentences) {
    const notes: SentenceNote[] = await listSentenceNotes(s.id)
    for (const n of notes) {
      if (n.type === 'vocab') {
        const target = (n.target ?? '').toString().trim()
        const native = (n.native ?? '').toString().trim()
        const fallbackText = (n.text ?? '').toString().trim()
        // Require target/native; if not present, try to derive from text (best-effort)
        if (!target || !native) {
          if (!fallbackText) continue
          // Best-effort split: `target - native`
          const parts = fallbackText.split(/\s*[-–—:]\s*/)
          if (parts.length >= 2) {
            all.push({
              id: `${s.id}:${n.id}`,
              sentenceId: s.id,
              sentenceText: s.text,
              ...(n.morphemeText ? { morphemeText: n.morphemeText } : {}),
              target: parts[0]!,
              native: parts.slice(1).join(' - '),
              ...(n.pos ? { pos: n.pos } : {}),
              ...(Array.isArray(n.tags) && n.tags.length ? { tags: n.tags } : {}),
              createdAt: n.createdAt ?? null,
            })
          }
          continue
        }
        all.push({
          id: `${s.id}:${n.id}`,
          sentenceId: s.id,
          sentenceText: s.text,
          ...(n.morphemeText ? { morphemeText: n.morphemeText } : {}),
          target,
          native,
          ...(n.pos ? { pos: n.pos } : {}),
          ...(Array.isArray(n.tags) && n.tags.length ? { tags: n.tags } : {}),
          createdAt: n.createdAt ?? null,
        })
      }
    }
  }
  all.sort((a, b) => {
    const at = a.createdAt ? Date.parse(a.createdAt) : 0
    const bt = b.createdAt ? Date.parse(b.createdAt) : 0
    return bt - at
  })
  return all.slice(0, Math.max(0, limitN))
}
