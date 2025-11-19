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
  tags?: string[]
  createdAt: string | null
}

export type SentenceNoteInput =
  | {
      type: 'vocab'
      target: string
      native: string
      pos?: string
      morphemeText?: string
      tags?: string[]
    }
  | { type: 'grammar'; text: string; morphemeText?: string }

