/**
 * Session Store
 *
 * Manages the current parsing session state. Business logic for morpheme
 * manipulation is delegated to morphemeService following the "smart stores,
 * dumb components" pattern (§ 4.2).
 *
 * This store manages:
 * - Current session state (idle, editing, parsing)
 * - Session data (sentence, morphemes, flow nodes/edges)
 * - Export/import functionality
 */
import { readable, writable, type Writable } from 'svelte/store'
import type {
  AppMode,
  PosTag,
  Note,
  MorphemeMeta,
  FlowNode,
  FlowEdge,
  ParseSession,
  SessionState,
} from '$lib/schemas/session'
import {
  generateId,
  tokenizeToMorphemes,
  morphemesToFlow,
  breakMorphemeAt,
  combineMorphemesByIds,
  editMorphemeText as editMorphemeTextService,
  insertMorpheme as insertMorphemeService,
  addNoteToMorpheme as addNoteToMorphemeService,
  autoSegmentSentence,
  type SegmenterLocale,
} from '$lib/services/morphemeService'

// Re-export types for backward compatibility
export type {
  AppMode,
  PosTag,
  Note,
  MorphemeMeta,
  FlowNode,
  FlowEdge,
  ParseSession,
  SessionState,
}

export interface AutoSegmentSummary {
  applied: boolean
  locale: SegmenterLocale
  usedSegmenter: boolean
  morphemeCount: number
}

// ─────────────────────────────────────────────────────────────
// Validation Utilities
// ─────────────────────────────────────────────────────────────

const VALID_MODES: AppMode[] = ['idle', 'editing', 'parsing']

/**
 * Type guard to validate SessionState structure.
 * Ensures imported JSON has the expected shape.
 */
function isValidSessionState(value: unknown): value is SessionState {
  if (typeof value !== 'object' || value === null) return false

  const obj = value as Record<string, unknown>

  // Validate mode
  if (!VALID_MODES.includes(obj.mode as AppMode)) return false

  // current can be null
  if (obj.current === null) return true

  // Validate ParseSession structure
  if (typeof obj.current !== 'object') return false

  const session = obj.current as Record<string, unknown>

  // Required string fields
  if (typeof session.id !== 'string') return false
  if (typeof session.sentence !== 'string') return false
  if (typeof session.createdAt !== 'string') return false

  // Required array fields
  if (!Array.isArray(session.morphemes)) return false
  if (!Array.isArray(session.nodes)) return false
  if (!Array.isArray(session.edges)) return false
  if (!Array.isArray(session.tags)) return false

  // Boolean field
  if (typeof session.completed !== 'boolean') return false

  // Nullable string field
  if (session.lastReviewedAt !== null && typeof session.lastReviewedAt !== 'string') return false

  return true
}

/**
 * Validation error for invalid session imports.
 */
export class SessionValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SessionValidationError'
  }
}

// ─────────────────────────────────────────────────────────────
// Session Store Factory
// ─────────────────────────────────────────────────────────────

function createSessionStore() {
  const { subscribe, update }: Writable<SessionState> = writable({
    mode: 'idle',
    current: null,
  })

  // ─────────────────────────────────────────────────────────────
  // Session Lifecycle
  // ─────────────────────────────────────────────────────────────

  const startNew = () => {
    update(() => ({
      mode: 'editing',
      current: {
        id: generateId('s'),
        sentence: '',
        morphemes: [],
        nodes: [],
        edges: [],
        createdAt: new Date().toISOString(),
        lastReviewedAt: null,
        completed: false,
        tags: [],
      },
    }))
  }

  const updateSentence = (sentence: string) => {
    update(state => {
      if (!state.current) return state
      return {
        ...state,
        current: {
          ...state.current,
          sentence,
        },
      }
    })
  }

  const beginParse = () => {
    update(state => {
      if (!state.current) return state
      // Delegate tokenization to service
      const morphemes = tokenizeToMorphemes(state.current.sentence)
      const { nodes, edges } = morphemesToFlow(morphemes)
      return {
        ...state,
        mode: 'parsing',
        current: {
          ...state.current,
          morphemes,
          nodes,
          edges,
        },
      }
    })
  }

  const autoSegment = (localePreference?: SegmenterLocale): AutoSegmentSummary => {
    let summary: AutoSegmentSummary = {
      applied: false,
      locale: localePreference ?? 'en',
      usedSegmenter: false,
      morphemeCount: 0,
    }

    update(state => {
      if (!state.current) return state

      const sentence = state.current.sentence?.trim() ?? ''
      if (!sentence) return state

      const { morphemes, locale, usedSegmenter } = autoSegmentSentence(
        sentence,
        localePreference
      )

      if (!morphemes.length) return state

      const { nodes, edges } = morphemesToFlow(morphemes)
      summary = {
        applied: true,
        locale,
        usedSegmenter,
        morphemeCount: morphemes.length,
      }

      return {
        ...state,
        mode: 'parsing',
        current: {
          ...state.current,
          morphemes,
          nodes,
          edges,
        },
      }
    })

    return summary
  }

  const toggleEdit = () => {
    update(state => ({
      ...state,
      mode: state.mode === 'parsing' ? 'editing' : 'parsing',
    }))
  }

  const setCompleted = (completed: boolean) => {
    update(state => {
      if (!state.current) return state
      return {
        ...state,
        current: {
          ...state.current,
          completed,
        },
      }
    })
  }

  // ─────────────────────────────────────────────────────────────
  // Morpheme Operations (delegated to morphemeService)
  // ─────────────────────────────────────────────────────────────

  const breakMorpheme = (morphemeId: string, breakIndex: number) => {
    update(state => {
      if (!state.current) return state

      // Delegate to service
      const result = breakMorphemeAt(state.current.morphemes, morphemeId, breakIndex)
      if (!result) return state

      const { nodes, edges } = morphemesToFlow(result)
      return {
        ...state,
        current: {
          ...state.current,
          morphemes: result,
          nodes,
          edges,
        },
      }
    })
  }

  const combineMorphemes = (morphemeIds: string[]) => {
    update(state => {
      if (!state.current || morphemeIds.length < 2) return state

      // Delegate to service
      const result = combineMorphemesByIds(state.current.morphemes, morphemeIds)
      if (!result) return state

      const { nodes, edges } = morphemesToFlow(result)
      return {
        ...state,
        current: {
          ...state.current,
          morphemes: result,
          nodes,
          edges,
        },
      }
    })
  }

  const editMorphemeText = (morphemeId: string, newText: string) => {
    update(state => {
      if (!state.current) return state

      // Delegate to service
      const result = editMorphemeTextService(state.current.morphemes, morphemeId, newText)
      if (!result) return state

      const { nodes, edges } = morphemesToFlow(result.morphemes)
      return {
        ...state,
        current: {
          ...state.current,
          sentence: result.sentence,
          morphemes: result.morphemes,
          nodes,
          edges,
        },
      }
    })
  }

  const insertMorpheme = (
    position: 'left' | 'right',
    targetMorphemeId: string,
    newText: string
  ) => {
    update(state => {
      if (!state.current) return state

      // Delegate to service
      const result = insertMorphemeService(
        state.current.morphemes,
        position,
        targetMorphemeId,
        newText
      )
      if (!result) return state

      const { nodes, edges } = morphemesToFlow(result.morphemes)
      return {
        ...state,
        current: {
          ...state.current,
          sentence: result.sentence,
          morphemes: result.morphemes,
          nodes,
          edges,
        },
      }
    })
  }

  const addNoteToMorpheme = (
    morphemeId: string,
    payload:
      | { type: 'vocab'; target: string; native: string; pos?: PosTag; tags?: string[] }
      | { type: 'grammar'; text: string }
  ) => {
    update(state => {
      if (!state.current) return state

      // Delegate to service
      const morphemes = addNoteToMorphemeService(state.current.morphemes, morphemeId, payload)
      const { nodes, edges } = morphemesToFlow(morphemes)

      return {
        ...state,
        current: {
          ...state.current,
          morphemes,
          nodes,
          edges,
        },
      }
    })
  }

  // ─────────────────────────────────────────────────────────────
  // Export/Import
  // ─────────────────────────────────────────────────────────────

  const exportJSON = () => {
    let snapshot: SessionState | null = null
    const unsub = subscribe(s => (snapshot = s))
    unsub()

    const data = JSON.stringify(snapshot, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `lingua-session-${Date.now()}.json`
    a.click()

    URL.revokeObjectURL(url)
  }

  const importJSON = async (file: File) => {
    const text = await file.text()

    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      throw new SessionValidationError('Invalid JSON format in session file')
    }

    if (!isValidSessionState(parsed)) {
      throw new SessionValidationError(
        'Invalid session file structure. Expected a valid SessionState object with mode, and optional current session data.'
      )
    }

    update(() => parsed)
  }

  // ─────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────

  return {
    subscribe,
    startNew,
    updateSentence,
    beginParse,
    autoSegment,
    toggleEdit,
    setCompleted,
    exportJSON,
    importJSON,
    addNoteToMorpheme,
    breakMorpheme,
    combineMorphemes,
    editMorphemeText,
    insertMorpheme,
  }
}

// ─────────────────────────────────────────────────────────────
// Store Exports
// ─────────────────────────────────────────────────────────────

export const sessionStore = createSessionStore()

export const modes = readable<AppMode[]>(['idle', 'editing', 'parsing'])
