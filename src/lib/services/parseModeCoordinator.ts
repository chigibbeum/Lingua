/**
 * Parse Mode Coordinator
 *
 * Handles reactive coordination between session state and UI state.
 * Extracted from ParseMode.svelte to follow the "smart stores, dumb components"
 * pattern (§ 4.2).
 *
 * This coordinator manages:
 * - Auto-switching actions based on session state
 * - Unsaved changes tracking
 * - Keyboard shortcut handling
 */
import { get } from 'svelte/store'
import { sessionStore, type SessionState } from '$lib/stores/session'
import { parseUIStore } from '$lib/stores/parseUI'

// ─────────────────────────────────────────────────────────────
// State Synchronization
// ─────────────────────────────────────────────────────────────

/**
 * Sync UI state based on session state changes.
 * This is called reactively when session state changes.
 */
export function syncUIWithSession(session: SessionState): void {
  const ui = get(parseUIStore)

  // Auto-switch to parse action after text is submitted
  if (
    session.mode === 'parsing' &&
    (session.current?.morphemes?.length ?? 0) > 0 &&
    ui.currentAction === 'add-new'
  ) {
    parseUIStore.setAction('parse')
  }

  // Reset to add-new when starting fresh
  if (session.mode === 'editing' && !session.current?.sentence) {
    parseUIStore.setAction('add-new')
  }
}

/**
 * Update unsaved changes tracking based on session state.
 */
export function updateUnsavedChanges(session: SessionState): void {
  const hasText = Boolean(session.current?.sentence && session.current.sentence.trim().length > 0)
  const hasMorphemes = Boolean(
    session.current?.morphemes?.length && session.current.morphemes.length > 0
  )
  parseUIStore.setUnsavedChanges(hasText || hasMorphemes)
}

// ─────────────────────────────────────────────────────────────
// Keyboard Shortcuts
// ─────────────────────────────────────────────────────────────

/**
 * Handle parse mode keyboard shortcuts.
 * - Ctrl/Cmd+Shift+H: Toggle history panel
 */
export function handleParseModeKeydown(e: KeyboardEvent): void {
  const isHistoryCombo =
    (e.key === 'h' || e.key === 'H') && (e.ctrlKey || e.metaKey) && e.shiftKey

  if (isHistoryCombo) {
    e.preventDefault()
    e.stopPropagation()
    parseUIStore.toggleModal('history')
  }
}

// ─────────────────────────────────────────────────────────────
// Initialization
// ─────────────────────────────────────────────────────────────

/**
 * Initialize parse mode coordination.
 * Sets up reactive subscriptions and event listeners.
 * Returns a cleanup function.
 */
export function initParseModeCoordination(): () => void {
  // Subscribe to session changes and sync UI
  const unsubscribe = sessionStore.subscribe(session => {
    syncUIWithSession(session)
    updateUnsavedChanges(session)
  })

  // Set up keyboard shortcut listener
  window.addEventListener('keydown', handleParseModeKeydown)

  // Return cleanup function
  return () => {
    unsubscribe()
    window.removeEventListener('keydown', handleParseModeKeydown)
  }
}

// ─────────────────────────────────────────────────────────────
// Session Hydration
// ─────────────────────────────────────────────────────────────

/**
 * Initialize or hydrate session from snapshot.
 * Called on parse mode mount.
 */
export function initializeSession(initialSession: SessionState | null): void {
  const currentSession = get(sessionStore)

  // Only start new if idle
  if (currentSession.mode === 'idle') {
    sessionStore.startNew()

    // Hydrate with initial sentence if provided
    const initialSentence = initialSession?.current?.sentence ?? ''
    if (initialSentence.trim().length > 0) {
      sessionStore.updateSentence(initialSentence)
    }
  }
}

