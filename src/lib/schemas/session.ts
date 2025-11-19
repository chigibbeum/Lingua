export type AppMode = 'idle' | 'editing' | 'parsing'

export type PosTag =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'particle'
  | 'pronoun'
  | 'preposition'
  | 'conjunction'
  | 'interjection'
  | 'auxiliary'
  | 'classifier'
  | 'proper_noun'
  | 'numeral'
  | 'expression'
  | 'other'

export type Note =
  | {
      id: string
      type: 'vocab'
      target: string
      native: string
      pos?: PosTag
      /**
       * Optional topic/semantic tags attached at note time.
       * These are propagated into flashcards to drive Deck Library tag-based views.
       */
      tags?: string[]
      createdAt: string
    }
  | { id: string; type: 'grammar'; text: string; createdAt: string }

export interface MorphemeMeta {
  id: string
  text: string
  createdAt: string
  lastReviewedAt: string | null
  vocabCount: number
  grammarCount: number
  tags: string[]
  notes: Note[]
}

export interface FlowNode {
  id: string
  position: {
    x: number
    y: number
  }
  data: {
    label: string
  }
}

export interface FlowEdge {
  id: string
  source: string
  target: string
}

export interface ParseSession {
  id: string
  sentence: string
  morphemes: MorphemeMeta[]
  nodes: FlowNode[]
  edges: FlowEdge[]
  createdAt: string
  lastReviewedAt: string | null
  completed: boolean
  tags: string[]
}

export interface SessionState {
  mode: AppMode
  current: ParseSession | null
}

