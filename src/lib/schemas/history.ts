export type HistoryScope = 'parse' | 'flashcard'
export type HistoryAction =
  | 'new-text'
  | 'parse'
  | 'edit'
  | 'save'
  | 'create-flashcard'
  | 'review'
  | 'other'

export type HistoryEntry = {
  id: string
  scope: HistoryScope
  action: HistoryAction
  title: string
  description?: string
  snippet?: string
  relatedId?: string
  timestamp: string
  pinned?: boolean
}

