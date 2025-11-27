/**
 * Parse Mode UI State Store
 *
 * Centralizes UI state management for Parse Mode, following the
 * "smart stores, dumb components" pattern (§ 4.2, § 4.3).
 *
 * This store manages:
 * - Current parsing action (add-new, parse, edit)
 * - Active toolbar action state
 * - Unsaved changes tracking
 * - Modal visibility states
 */
import { writable, derived } from 'svelte/store'

export type ParsingAction = 'add-new' | 'parse' | 'edit'

export interface ParseUIState {
  currentAction: ParsingAction
  activeToolbarAction: string | null
  hasUnsavedChanges: boolean
  modals: {
    sentenceLibrary: boolean
    createFlashcards: boolean
    deckLibrary: boolean
    settings: boolean
    history: boolean
  }
}

const initialState: ParseUIState = {
  currentAction: 'add-new',
  activeToolbarAction: 'new-text',
  hasUnsavedChanges: false,
  modals: {
    sentenceLibrary: false,
    createFlashcards: false,
    deckLibrary: false,
    settings: false,
    history: false,
  },
}

function createParseUIStore() {
  const { subscribe, update, set } = writable<ParseUIState>(initialState)

  return {
    subscribe,

    /**
     * Set the current parsing action and update toolbar state accordingly
     */
    setAction(action: ParsingAction) {
      update(state => ({
        ...state,
        currentAction: action,
        activeToolbarAction: action === 'add-new' ? 'new-text' : action,
      }))
    },

    /**
     * Set only the toolbar action (for highlighting)
     */
    setToolbarAction(action: string | null) {
      update(state => ({
        ...state,
        activeToolbarAction: action,
      }))
    },

    /**
     * Track whether there are unsaved changes
     */
    setUnsavedChanges(hasChanges: boolean) {
      update(state => ({
        ...state,
        hasUnsavedChanges: hasChanges,
      }))
    },

    /**
     * Open a specific modal
     */
    openModal(modal: keyof ParseUIState['modals']) {
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
    closeModal(modal: keyof ParseUIState['modals']) {
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
    toggleModal(modal: keyof ParseUIState['modals']) {
      update(state => ({
        ...state,
        modals: {
          ...state.modals,
          [modal]: !state.modals[modal],
        },
      }))
    },

    /**
     * Reset to initial state (useful when navigating away)
     */
    reset() {
      set(initialState)
    },
  }
}

export const parseUIStore = createParseUIStore()

// Derived stores for convenient subscriptions in components
export const currentAction = derived(parseUIStore, $s => $s.currentAction)
export const activeToolbarAction = derived(parseUIStore, $s => $s.activeToolbarAction)
export const hasUnsavedChanges = derived(parseUIStore, $s => $s.hasUnsavedChanges)
export const modals = derived(parseUIStore, $s => $s.modals)
