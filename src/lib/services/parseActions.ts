/**
 * Parse Mode Business Logic
 * 
 * Extracted from ParseMode.svelte to follow the "smart stores, dumb components"
 * pattern (§ 4.2). This service handles:
 * - Action switching with unsaved changes confirmation
 * - Save workflow with note extraction
 * - Toolbar action routing
 * - History logging
 */
import { get } from 'svelte/store'
import { parseUIStore, type ParsingAction } from '$lib/stores/parseUI'
import { sessionStore, type SessionState } from '$lib/stores/session'
import { historyStore } from '$lib/stores/history'
import { toastStore } from '$lib/stores/toast'
import { saveSentenceWithNotes } from '$lib/services/sentenceService'
import { isLoggedIn } from '$lib/stores/auth'

export interface ActionResult {
  success: boolean
  message: string
}

/**
 * Handle switching between parsing actions (add-new, parse, edit).
 * Prompts for confirmation if there are unsaved changes.
 */
export function handleActionChange(action: ParsingAction): boolean {
  const uiState = get(parseUIStore)
  const session = get(sessionStore)

  // If switching to add-new and there are unsaved changes, prompt user
  if (action === 'add-new' && uiState.hasUnsavedChanges && session.current?.morphemes?.length) {
    const shouldContinue = confirm(
      'You have unsaved changes. Do you want to continue without saving?'
    )
    if (!shouldContinue) return false
  }

  parseUIStore.setAction(action)
  parseUIStore.setUnsavedChanges(false)

  // Reset to editing mode when switching to add-new
  if (action === 'add-new') {
    sessionStore.startNew()
  }

  return true
}

/**
 * Save the current sentence with all attached notes.
 * Returns a result object with success status and message.
 */
export async function handleSave(): Promise<ActionResult> {
  const session = get(sessionStore)

  if (session.mode !== 'parsing') {
    return { success: false, message: 'Switch to parsing mode to save the typed sentence.' }
  }

  if (!get(isLoggedIn)) {
    return { success: false, message: 'Please log in to save your sentence.' }
  }

  const text = session.current?.sentence?.trim() ?? ''
  if (!text) {
    return { success: false, message: 'Type a sentence before saving.' }
  }

  const morphemes = session.current?.morphemes ?? []
  const noteInputs = morphemes.flatMap(m =>
    m.notes.map(n =>
      n.type === 'vocab'
        ? {
            type: 'vocab' as const,
            target: n.target,
            native: n.native,
            ...('pos' in n && n.pos ? { pos: n.pos } : {}),
            ...(Array.isArray(n.tags) && n.tags.length ? { tags: n.tags } : {}),
            morphemeText: m.text,
          }
        : {
            type: 'grammar' as const,
            text: n.text,
            morphemeText: m.text,
          }
    )
  )

  try {
    await saveSentenceWithNotes(text, noteInputs)
    const count = noteInputs.length

    historyStore.add({
      scope: 'parse',
      action: 'save',
      title: 'Saved sentence',
      ...(count ? { description: `Saved ${count} note${count === 1 ? '' : 's'}` } : {}),
      snippet: text,
      ...(session.current?.id ? { relatedId: session.current.id } : {}),
    })

    // Reset after successful save
    sessionStore.startNew()
    parseUIStore.setAction('add-new')
    parseUIStore.setUnsavedChanges(false)

    return {
      success: true,
      message: `Saved sentence${count ? ` with ${count} note${count === 1 ? '' : 's'}` : ''}`,
    }
  } catch (e: unknown) {
    console.error('Failed to save sentence and notes', e)
    const err = e as { code?: string }
    const msg =
      err?.code === 'permission-denied'
        ? 'No permission to save. Check Firestore rules.'
        : 'Failed to save sentence and notes. Try again.'
    return { success: false, message: msg }
  }
}

/**
 * Handle toolbar action clicks.
 * Routes to appropriate handlers based on action type.
 */
export function handleToolbarAction(action: string, session: SessionState): void {
  parseUIStore.setToolbarAction(action)

  switch (action) {
    case 'new-text':
      handleActionChange('add-new')
      break

    case 'parse':
      if ((session.current?.morphemes?.length ?? 0) > 0) {
        handleActionChange('parse')
        historyStore.add({
          scope: 'parse',
          action: 'parse',
          title: 'Parsed sentence',
          ...(session.current?.sentence ? { snippet: session.current.sentence } : {}),
          ...(session.current?.id ? { relatedId: session.current.id } : {}),
        })
      }
      break

    case 'auto-segment': {
      const text = session.current?.sentence?.trim() ?? ''
      if (!text) {
        toastStore.info('Type a sentence before using auto segment.')
        return
      }

      const result = sessionStore.autoSegment()
      if (!result.applied) {
        toastStore.error('Unable to segment this sentence automatically.')
        return
      }

      parseUIStore.setAction('parse')
      toastStore.success(
        `Segmented ${result.morphemeCount} part${result.morphemeCount === 1 ? '' : 's'} (${
          result.locale === 'ko' ? 'Korean' : 'English'
        })`
      )

      historyStore.add({
        scope: 'parse',
        action: 'auto-segment',
        title: 'Auto segmented sentence',
        description: result.usedSegmenter
          ? `Intl.Segmenter (${result.locale.toUpperCase()})`
          : 'Fallback tokenizer used',
        ...(session.current?.sentence ? { snippet: session.current.sentence } : {}),
        ...(session.current?.id ? { relatedId: session.current.id } : {}),
      })
      break
    }

    case 'edit':
      if ((session.current?.morphemes?.length ?? 0) > 0) {
        handleActionChange('edit')
      }
      break

    case 'create-flashcard':
      if (!get(isLoggedIn)) {
        toastStore.warning('Please log in to create flashcards.')
        return
      }
      if (!session.current) {
        toastStore.warning('No session loaded.')
        return
      }
      parseUIStore.openModal('createFlashcards')
      break

    case 'save':
      handleSave().then(result => {
        if (result.success) {
          toastStore.success(result.message)
        } else {
          toastStore.error(result.message)
        }
      })
      break

    case 'history':
      parseUIStore.toggleModal('history')
      break
  }
}

/**
 * Log flashcard creation to history.
 * Called after successful flashcard creation.
 */
export function logFlashcardCreation(count: number, session: SessionState): void {
  if (count > 0) {
    historyStore.add({
      scope: 'parse',
      action: 'create-flashcard',
      title: `Created ${count} flashcard${count === 1 ? '' : 's'}`,
      ...(session.current?.sentence ? { snippet: session.current.sentence } : {}),
      ...(session.current?.id ? { relatedId: session.current.id } : {}),
    })
  }
}

