/**
 * Flashcard Mode Business Logic
 *
 * Extracted from FlashcardMode.svelte to follow the "smart stores, dumb components"
 * pattern (§ 4.2). This service handles:
 * - Card loading
 * - Vocabulary item loading for flashcard creation
 * - Review actions with history logging
 * - Toolbar action routing
 * - Keyboard and touch event handling
 */
import { get } from 'svelte/store'
import { flashcardUIStore } from '$lib/stores/flashcardUI'
import { historyStore } from '$lib/stores/history'
import { listFlashcards, type Flashcard } from '$lib/services/flashcardService'
import { listRecentVocabNotes, type RecentVocabNote } from '$lib/services/noteService'
import type { ParseSession } from '$lib/stores/session'

// ─────────────────────────────────────────────────────────────
// Types for Flashcard Creation
// ─────────────────────────────────────────────────────────────

export interface VocabItem {
  id: string
  front: string
  back: string
  sentenceText?: string
  morphemeText?: string
  sentenceId?: string
  morphemeId?: string
  pos?: string
  createdAt?: string | null
  tags?: string[]
}

// ─────────────────────────────────────────────────────────────
// Deduplication Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Generate a deduplication key for a vocab item (sentence + front + back)
 */
function dedupKey(it: { sentenceText?: string; front?: string; back?: string }): string {
  const sent = String(it.sentenceText ?? '')
    .trim()
    .toLowerCase()
  const front = String(it.front ?? '')
    .trim()
    .toLowerCase()
  const back = String(it.back ?? '')
    .trim()
    .toLowerCase()
  return `${sent}||${front}||${back}`
}

/**
 * Generate a pair key for a vocab item (front + back only)
 */
function pairKey(it: { front?: string; back?: string }): string {
  const front = String(it.front ?? '')
    .trim()
    .toLowerCase()
  const back = String(it.back ?? '')
    .trim()
    .toLowerCase()
  return `${front}||${back}`
}

/**
 * Normalize session morphemes into VocabItems
 */
function normalizeSessionItems(s: ParseSession | null): VocabItem[] {
  if (!s?.morphemes?.length) return []
  const acc: VocabItem[] = []
  for (const m of s.morphemes) {
    for (const n of m.notes) {
      if (n.type === 'vocab') {
        acc.push({
          id: `${s.id}:${m.id}:${n.id}`,
          front: n.target,
          back: n.native,
          sentenceText: s.sentence,
          morphemeText: m.text,
          sentenceId: s.id,
          morphemeId: m.id,
          ...(n.pos ? { pos: n.pos } : {}),
          ...(Array.isArray(n.tags) && n.tags.length ? { tags: n.tags } : {}),
          createdAt: n.createdAt,
        })
      }
    }
  }
  return acc
}

// ─────────────────────────────────────────────────────────────
// Vocabulary Loading for Flashcard Creation
// ─────────────────────────────────────────────────────────────

/**
 * Load and merge vocabulary items for flashcard creation.
 * Filters out duplicates and already-created flashcards.
 *
 * This is extracted from CreateFlashcardsModal to follow the
 * "smart stores, dumb components" pattern.
 */
export async function loadVocabItemsForFlashcards(
  session: ParseSession | null,
  limit = 7
): Promise<VocabItem[]> {
  // Load recent vocabulary notes from the database
  const recent: RecentVocabNote[] = await listRecentVocabNotes(limit)

  // Transform to VocabItem format
  const recentItems: VocabItem[] = recent.map(r => ({
    id: r.id,
    front: r.target,
    back: r.native,
    sentenceText: r.sentenceText,
    morphemeText: r.morphemeText,
    sentenceId: r.sentenceId,
    ...(r.pos ? { pos: r.pos } : {}),
    ...(Array.isArray(r.tags) && r.tags.length ? { tags: r.tags } : {}),
    createdAt: r.createdAt,
  }))

  // Get items from current session
  const sessionItems = normalizeSessionItems(session)

  // Merge by content key; prefer session entries for richer context
  const byKey = new Map<string, VocabItem>()
  for (const it of recentItems) byKey.set(dedupKey(it), it)
  for (const it of sessionItems) byKey.set(dedupKey(it), it)
  let merged = Array.from(byKey.values())

  // If a current sentence is available, focus on it and hide notes already flashcarded
  const sentenceText = session?.sentence?.trim()
  if (sentenceText) {
    const sentenceLc = sentenceText.toLowerCase()
    merged = merged.filter(it => (it.sentenceText ?? '').trim().toLowerCase() === sentenceLc)

    // Hide globally existing vocab pairs (front/back), regardless of sentence
    const existingAll = await listFlashcards('vocab')
    const existingPairKeys = new Set(
      existingAll.map(fc =>
        pairKey({
          front: fc.front,
          back: fc.back,
        })
      )
    )
    merged = merged.filter(it => !existingPairKeys.has(pairKey(it)))
  }

  // Sort by creation date descending
  merged.sort((a, b) => {
    const at = a.createdAt ? Date.parse(a.createdAt) : 0
    const bt = b.createdAt ? Date.parse(b.createdAt) : 0
    return bt - at
  })

  return merged.slice(0, limit)
}

// ─────────────────────────────────────────────────────────────
// Card Loading
// ─────────────────────────────────────────────────────────────

/**
 * Load flashcards from the service.
 * Updates the store with loading/error states.
 */
export async function loadCards(): Promise<void> {
  flashcardUIStore.setLoading(true)
  try {
    const cards = await listFlashcards()
    flashcardUIStore.setCards(cards)
  } catch (caught: unknown) {
    const message = caught instanceof Error ? caught.message : 'Failed to load flashcards'
    flashcardUIStore.setError(message)
  }
}

/**
 * Initialize cards from prefetched data or load from service.
 */
export function initializeCards(prefetchedCards?: Flashcard[]): void {
  if (prefetchedCards && prefetchedCards.length > 0) {
    flashcardUIStore.setCards(prefetchedCards)
  } else {
    loadCards()
  }
}

// ─────────────────────────────────────────────────────────────
// Review Actions
// ─────────────────────────────────────────────────────────────

/**
 * Mark the current card as correct and move to next.
 * Logs the review to history.
 */
export function markCorrect(): void {
  const state = get(flashcardUIStore)
  if (state.cards.length === 0) return

  const card = state.cards[state.currentIndex]
  if (!card) return

  historyStore.add({
    scope: 'flashcard',
    action: 'review',
    title: 'Reviewed card: Correct',
    relatedId: card.id,
    ...(card.type === 'vocab' ? { description: `${card.front} → ${card.back}` } : {}),
  })

  flashcardUIStore.next()
}

/**
 * Mark the current card as incorrect and move to next.
 * Logs the review to history.
 */
export function markIncorrect(): void {
  const state = get(flashcardUIStore)
  if (state.cards.length === 0) return

  const card = state.cards[state.currentIndex]
  if (!card) return

  historyStore.add({
    scope: 'flashcard',
    action: 'review',
    title: 'Reviewed card: Incorrect',
    relatedId: card.id,
    ...(card.type === 'vocab' ? { description: `${card.front} → ${card.back}` } : {}),
  })

  flashcardUIStore.next()
}

// ─────────────────────────────────────────────────────────────
// Toolbar Actions
// ─────────────────────────────────────────────────────────────

/**
 * Handle toolbar action clicks.
 * Routes to appropriate handlers based on action type.
 */
export function handleToolbarAction(action: string): void {
  flashcardUIStore.setToolbarAction(action)

  switch (action) {
    case 'add-flashcard':
      flashcardUIStore.openModal('addFlashcard')
      break
    case 'history':
      flashcardUIStore.toggleModal('history')
      break
    // Future actions like "filter" can be added here
  }
}

// ─────────────────────────────────────────────────────────────
// Keyboard Handling
// ─────────────────────────────────────────────────────────────

/**
 * Handle keyboard events for flashcard navigation.
 * - Space: Flip card
 * - ArrowRight: Next card
 * - ArrowLeft: Previous card
 * - Ctrl/Cmd+Shift+H: Toggle history
 */
export function handleKeydown(e: KeyboardEvent): void {
  if (e.key === ' ' || e.code === 'Space') {
    e.preventDefault()
    flashcardUIStore.flip()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    flashcardUIStore.next()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    flashcardUIStore.prev()
  } else if ((e.key === 'h' || e.key === 'H') && (e.ctrlKey || e.metaKey) && e.shiftKey) {
    e.preventDefault()
    e.stopPropagation()
    flashcardUIStore.toggleModal('history')
  }
}

// ─────────────────────────────────────────────────────────────
// Touch Handling
// ─────────────────────────────────────────────────────────────

/**
 * Touch handler factory that encapsulates touch tracking state.
 * Returns handlers with their own isolated state to prevent
 * interference between multiple component instances.
 */
export interface TouchHandlers {
  handleTouchStart: (e: TouchEvent) => void
  handleTouchEnd: (e: TouchEvent) => void
}

/**
 * Create touch handlers with encapsulated state.
 * Use this when you need isolated touch tracking per component instance.
 */
export function createTouchHandlers(): TouchHandlers {
  let touchStartX = 0
  let touchStartY = 0

  function handleTouchStart(e: TouchEvent): void {
    if (e.touches.length !== 1) return
    const touch = e.touches.item(0)!
    touchStartX = touch.clientX
    touchStartY = touch.clientY
  }

  function handleTouchEnd(e: TouchEvent): void {
    if (e.changedTouches.length !== 1) return

    const touch = e.changedTouches.item(0)!
    const dx = touch.clientX - touchStartX
    const dy = touch.clientY - touchStartY
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)
    const threshold = 50

    if (absX > absY && absX > threshold) {
      // Horizontal swipe
      if (dx < 0) {
        flashcardUIStore.next()
      } else {
        flashcardUIStore.prev()
      }
    } else if (absY > threshold) {
      // Vertical swipe
      flashcardUIStore.flip()
    }
  }

  return { handleTouchStart, handleTouchEnd }
}

// Default handlers for backward compatibility
// These use shared state, which is fine for single-instance usage
const defaultHandlers = createTouchHandlers()

/**
 * Handle touch start event.
 * Records initial touch position for swipe detection.
 * @deprecated Use createTouchHandlers() for isolated state
 */
export const handleTouchStart = defaultHandlers.handleTouchStart

/**
 * Handle touch end event.
 * Detects swipe gestures:
 * - Horizontal swipe: Navigate cards
 * - Vertical swipe: Flip card
 * @deprecated Use createTouchHandlers() for isolated state
 */
export const handleTouchEnd = defaultHandlers.handleTouchEnd

// ─────────────────────────────────────────────────────────────
// Card Creation Callback
// ─────────────────────────────────────────────────────────────

/**
 * Handle successful flashcard creation.
 * Reloads the deck if cards were created.
 */
export function onCardsCreated(count: number): void {
  if (count > 0) {
    loadCards()
  }
}

