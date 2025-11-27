/**
 * Centralized Data Loaders
 *
 * Provides unified data fetching functions for page loaders and components.
 * Following "smart servers, dumb components" pattern (§ 4.2).
 *
 * Benefits:
 * - Single source of truth for data fetching logic
 * - Consistent error handling
 * - Easy to add caching later
 * - Testable in isolation
 */
import { get } from 'svelte/store'
import { historyStore, type HistoryEntry, type HistoryScope } from '$lib/stores/history'
import { sessionStore, type SessionState } from '$lib/stores/session'
import { listSentences, listSentenceNotes, type SentenceDoc, type SentenceNote } from '$lib/services/sentenceService'
import { listFlashcards, type Flashcard } from '$lib/services/flashcardService'

// ─────────────────────────────────────────────────────────────
// History Loaders
// ─────────────────────────────────────────────────────────────

export interface HistoryLoadResult {
  entries: HistoryEntry[]
}

/**
 * Load history entries filtered by scope.
 * Used by page loaders to prefetch relevant history.
 */
export function loadHistoryByScope(scope: HistoryScope | 'all', limit = 12): HistoryLoadResult {
  const all = get(historyStore)
  const filtered = scope === 'all' ? all : all.filter(entry => entry.scope === scope)
  return {
    entries: filtered.slice(0, limit),
  }
}

/**
 * Load parse mode history.
 */
export function loadParseHistory(limit = 12): HistoryEntry[] {
  return loadHistoryByScope('parse', limit).entries
}

/**
 * Load flashcard mode history.
 */
export function loadFlashcardHistory(limit = 12): HistoryEntry[] {
  return loadHistoryByScope('flashcard', limit).entries
}

// ─────────────────────────────────────────────────────────────
// Session Loaders
// ─────────────────────────────────────────────────────────────

/**
 * Get the current session state snapshot.
 * Used by parse page loader.
 */
export function getSessionSnapshot(): SessionState {
  return get(sessionStore)
}

// ─────────────────────────────────────────────────────────────
// Sentence Loaders
// ─────────────────────────────────────────────────────────────

export interface SentenceLoadResult {
  sentences: SentenceDoc[]
  error: string | null
}

/**
 * Load all sentences for the current user.
 * Returns empty array on error (safe for UI).
 */
export async function loadSentences(): Promise<SentenceLoadResult> {
  try {
    const sentences = await listSentences()
    return { sentences, error: null }
  } catch (caught: unknown) {
    const message = caught instanceof Error ? caught.message : 'Failed to load sentences'
    console.warn('[dataLoaders] Failed to load sentences', caught)
    return { sentences: [], error: message }
  }
}

/**
 * Load notes for a specific sentence.
 */
export async function loadSentenceNotes(sentenceId: string): Promise<{
  notes: SentenceNote[]
  error: string | null
}> {
  try {
    const notes = await listSentenceNotes(sentenceId)
    return { notes, error: null }
  } catch (caught: unknown) {
    const message = caught instanceof Error ? caught.message : 'Failed to load notes'
    console.warn('[dataLoaders] Failed to load notes for sentence', sentenceId, caught)
    return { notes: [], error: message }
  }
}

// ─────────────────────────────────────────────────────────────
// Flashcard Loaders
// ─────────────────────────────────────────────────────────────

export interface FlashcardLoadResult {
  cards: Flashcard[]
  error: string | null
}

/**
 * Load all flashcards for the current user.
 * Optionally filter by type.
 */
export async function loadFlashcards(type?: 'vocab' | 'grammar'): Promise<FlashcardLoadResult> {
  try {
    const cards = await listFlashcards(type)
    return { cards, error: null }
  } catch (caught: unknown) {
    const message = caught instanceof Error ? caught.message : 'Failed to load flashcards'
    console.warn('[dataLoaders] Failed to load flashcards', caught)
    return { cards: [], error: message }
  }
}

// ─────────────────────────────────────────────────────────────
// Composite Loaders (for page load functions)
// ─────────────────────────────────────────────────────────────

export interface ParsePageData {
  sessionSnapshot: SessionState
}

/**
 * Load all data needed for the parse page.
 * Used by +page.ts loader.
 */
export function loadParsePageData(): ParsePageData {
  const sessionSnapshot = getSessionSnapshot()

  return {
    sessionSnapshot,
  }
}

export interface FlashcardPageData {
  flashHistory: HistoryEntry[]
  flashcards: Flashcard[]
}

/**
 * Load all data needed for the flashcard page.
 * Used by +page.ts loader.
 */
export async function loadFlashcardPageData(): Promise<FlashcardPageData> {
  const flashHistory = loadFlashcardHistory()
  const { cards: flashcards } = await loadFlashcards()

  return {
    flashHistory,
    flashcards,
  }
}

// ─────────────────────────────────────────────────────────────
// Re-exports for convenience
// ─────────────────────────────────────────────────────────────

export type { SentenceDoc, SentenceNote, Flashcard, HistoryEntry, HistoryScope, SessionState }

