import type { Timestamp } from 'firebase/firestore'

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
  /**
   * Optional part-of-speech associated with this card (for vocab cards).
   * Derived from vocab notes in parsing mode or the manual creation form.
   */
  pos?: string
  /**
   * Optional topic/semantic tags associated with this card.
   * These are used by the Deck Library to provide tag-based deck groupings.
   */
  tags?: string[]
}

export type VocabFlashInput = {
  front: string
  back: string
  sentenceText?: string
  morphemeText?: string
  sentenceId?: string
  morphemeId?: string
  pos?: string
  tags?: string[]
}

export type FlashcardDoc = {
  type?: 'vocab' | 'grammar'
  front?: unknown
  back?: unknown
  sentenceText?: unknown
  morphemeText?: unknown
  sentenceId?: unknown
  morphemeId?: unknown
  createdAt?: Timestamp | string | null
  pos?: unknown
  tags?: unknown
}

