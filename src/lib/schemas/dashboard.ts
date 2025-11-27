import type { HistoryEntry } from './history'
import type { AppMode } from './session'
import type { PosChipFormat } from './settings'

export interface DashboardSnapshot {
  activeMode: AppMode
  totals: {
    parseSessions: number
    flashcardReviews: number
  }
  recentHistory: HistoryEntry[]
  preferences: {
    posChipFormat: PosChipFormat
  }
}


