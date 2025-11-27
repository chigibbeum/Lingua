export type RecentVocabNote = {
  id: string
  sentenceId: string
  sentenceText: string
  morphemeText?: string
  target: string
  native: string
  pos?: string
  tags?: string[]
  createdAt: string | null
}

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


