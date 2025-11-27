/**
 * Flashcard Mode UI State Store
 *
 * Centralizes UI state management for Flashcard Mode, following the
 * "smart stores, dumb components" pattern (§ 4.2, § 4.3).
 *
 * This store manages:
 * - Card deck state (cards, current index, flip state)
 * - Loading and error states
 * - Modal visibility states
 * - Active toolbar action
 * - Async data operations (orchestrating service calls)
 */
import { writable, derived, get } from 'svelte/store'
import {
  listFlashcards,
  createFlashcardsFromVocabNotes,
  type Flashcard,
  type VocabFlashInput,
} from '$lib/services/flashcardService'

export interface FlashcardUIState {
  // Deck state
  cards: Flashcard[]
  currentIndex: number
  isFlipped: boolean

  // Loading state
  isLoading: boolean
  error: string | null

  // Toolbar state
  activeToolbarAction: string | null

  // Modal visibility
  modals: {
    addFlashcard: boolean
    sentenceLibrary: boolean
    deckLibrary: boolean
    settings: boolean
    history: boolean
  }
}

const initialState: FlashcardUIState = {
  cards: [],
  currentIndex: 0,
  isFlipped: false,
  isLoading: false,
  error: null,
  activeToolbarAction: 'add-flashcard',
  modals: {
    addFlashcard: false,
    sentenceLibrary: false,
    deckLibrary: false,
    settings: false,
    history: false,
  },
}

function createFlashcardUIStore() {
  const { subscribe, update, set } = writable<FlashcardUIState>(initialState)

  return {
    subscribe,

    // ─────────────────────────────────────────────────────────────
    // Deck state management
    // ─────────────────────────────────────────────────────────────

    /**
     * Set the cards array (typically from loading)
     */
    setCards(cards: Flashcard[]) {
      update(state => ({
        ...state,
        cards,
        currentIndex: 0,
        isFlipped: false,
        isLoading: false,
        error: null,
      }))
    },

    /**
     * Set loading state
     */
    setLoading(isLoading: boolean) {
      update(state => ({
        ...state,
        isLoading,
        error: isLoading ? null : state.error,
      }))
    },

    /**
     * Set error state
     */
    setError(error: string | null) {
      update(state => ({
        ...state,
        error,
        isLoading: false,
      }))
    },

    /**
     * Flip the current card
     */
    flip() {
      update(state => {
        if (state.cards.length === 0) return state
        return { ...state, isFlipped: !state.isFlipped }
      })
    },

    /**
     * Go to the next card
     */
    next() {
      update(state => {
        if (state.cards.length === 0) return state
        return {
          ...state,
          currentIndex: (state.currentIndex + 1) % state.cards.length,
          isFlipped: false,
        }
      })
    },

    /**
     * Go to the previous card
     */
    prev() {
      update(state => {
        if (state.cards.length === 0) return state
        return {
          ...state,
          currentIndex: (state.currentIndex - 1 + state.cards.length) % state.cards.length,
          isFlipped: false,
        }
      })
    },

    /**
     * Shuffle the deck
     */
    shuffle() {
      update(state => {
        if (state.cards.length < 2) return state
        const arr = [...state.cards]
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          const tmp = arr[i]!
          arr[i] = arr[j]!
          arr[j] = tmp
        }
        return {
          ...state,
          cards: arr,
          currentIndex: 0,
          isFlipped: false,
        }
      })
    },

    // ─────────────────────────────────────────────────────────────
    // Toolbar state
    // ─────────────────────────────────────────────────────────────

    /**
     * Set the active toolbar action
     */
    setToolbarAction(action: string | null) {
      update(state => ({
        ...state,
        activeToolbarAction: action,
      }))
    },

    // ─────────────────────────────────────────────────────────────
    // Modal state management
    // ─────────────────────────────────────────────────────────────

    /**
     * Open a specific modal
     */
    openModal(modal: keyof FlashcardUIState['modals']) {
      update(state => ({
        ...state,
        modals: {
          ...state.modals,
          [modal]: true,
        },
      }))
    },

    /**
     * Close a specific modal
     */
    closeModal(modal: keyof FlashcardUIState['modals']) {
      update(state => ({
        ...state,
        modals: {
          ...state.modals,
          [modal]: false,
        },
      }))
    },

    /**
     * Toggle a modal's visibility
     */
    toggleModal(modal: keyof FlashcardUIState['modals']) {
      update(state => ({
        ...state,
        modals: {
          ...state.modals,
          [modal]: !state.modals[modal],
        },
      }))
    },

    // ─────────────────────────────────────────────────────────────
    // Reset
    // ─────────────────────────────────────────────────────────────

    /**
     * Reset to initial state
     */
    reset() {
      set(initialState)
    },

    // ─────────────────────────────────────────────────────────────
    // Async Data Operations
    // ─────────────────────────────────────────────────────────────

    /**
     * Load flashcards from service.
     * Orchestrates the service call and updates store state.
     */
    async loadCards(type?: 'vocab' | 'grammar'): Promise<void> {
      update(state => ({
        ...state,
        isLoading: true,
        error: null,
      }))

      try {
        const cards = await listFlashcards(type)
        update(state => ({
          ...state,
          cards,
          currentIndex: 0,
          isFlipped: false,
          isLoading: false,
          error: null,
        }))
      } catch (caught: unknown) {
        const message = caught instanceof Error ? caught.message : 'Failed to load flashcards'
        update(state => ({
          ...state,
          isLoading: false,
          error: message,
        }))
      }
    },

    /**
     * Create flashcards from vocab notes.
     * Orchestrates the service call and refreshes the deck on success.
     * Returns the count of created flashcards.
     */
    async createFromNotes(notes: VocabFlashInput[]): Promise<number> {
      update(state => ({
        ...state,
        isLoading: true,
        error: null,
      }))

      try {
        const count = await createFlashcardsFromVocabNotes(notes)

        // Refresh the deck after creation
        if (count > 0) {
          const cards = await listFlashcards()
          update(state => ({
            ...state,
            cards,
            currentIndex: 0,
            isFlipped: false,
            isLoading: false,
            error: null,
          }))
        } else {
          update(state => ({
            ...state,
            isLoading: false,
          }))
        }

        return count
      } catch (caught: unknown) {
        const message = caught instanceof Error ? caught.message : 'Failed to create flashcards'
        update(state => ({
          ...state,
          isLoading: false,
          error: message,
        }))
        throw caught
      }
    },

    /**
     * Initialize cards from prefetched data or load from service.
     * Used on component mount to avoid unnecessary API calls.
     */
    async initializeCards(prefetchedCards?: Flashcard[]): Promise<void> {
      if (prefetchedCards && prefetchedCards.length > 0) {
        update(state => ({
          ...state,
          cards: prefetchedCards,
          currentIndex: 0,
          isFlipped: false,
          isLoading: false,
          error: null,
        }))
      } else {
        await this.loadCards()
      }
    },
  }
}

// Re-export types for convenience
export type { VocabFlashInput }

export const flashcardUIStore = createFlashcardUIStore()

// Derived stores for convenient subscriptions in components
export const cards = derived(flashcardUIStore, $s => $s.cards)
export const currentIndex = derived(flashcardUIStore, $s => $s.currentIndex)
export const currentCard = derived(flashcardUIStore, $s => $s.cards[$s.currentIndex] ?? null)
export const isFlipped = derived(flashcardUIStore, $s => $s.isFlipped)
export const isLoading = derived(flashcardUIStore, $s => $s.isLoading)
export const error = derived(flashcardUIStore, $s => $s.error)
export const activeToolbarAction = derived(flashcardUIStore, $s => $s.activeToolbarAction)
export const modals = derived(flashcardUIStore, $s => $s.modals)

