/**
 * Morpheme Service
 *
 * Handles all morpheme manipulation business logic, extracted from session store
 * to follow the "smart stores, dumb components" pattern (§ 4.2).
 *
 * This service handles:
 * - Text tokenization into morphemes
 * - Morpheme break/combine operations
 * - Smart text joining with punctuation rules
 * - Note creation for morphemes
 * - Flow node/edge generation for visualization
 */

import type { MorphemeMeta, Note, PosTag, FlowNode, FlowEdge } from '$lib/schemas/session'

// ─────────────────────────────────────────────────────────────
// ID Generation
// ─────────────────────────────────────────────────────────────

/**
 * Generate a unique ID with optional prefix
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

// ─────────────────────────────────────────────────────────────
// Tokenization
// ─────────────────────────────────────────────────────────────

// Locale support is intentionally narrow (English + Korean) per § 3.6 Modes.
export type SegmenterLocale = 'en' | 'ko'

interface TokenizationResult {
  tokens: string[]
  locale: SegmenterLocale
  usedSegmenter: boolean
}

const WORD_REGEX = /[\p{L}\p{N}]+|[^\s\p{L}\p{N}]/gu
const HANGUL_REGEX = /\p{Script=Hangul}/u

const hasSegmenterSupport = typeof Intl !== 'undefined' && 'Segmenter' in Intl

/**
 * Tokenize a sentence into morphemes (words/numbers or single punctuation/symbols)
 * Uses Unicode-aware regex for international language support
 */
export function tokenizeToMorphemes(sentence: string): MorphemeMeta[] {
  const tokens = regexTokenize(sentence)
  return tokensToMorphemes(tokens)
}

/**
 * Auto-segment a sentence using Intl.Segmenter when available.
 * Falls back to regex tokenization when unsupported.
 */
export function autoSegmentSentence(
  sentence: string,
  localePreference?: SegmenterLocale
): { morphemes: MorphemeMeta[]; locale: SegmenterLocale; usedSegmenter: boolean } {
  const { tokens, locale, usedSegmenter } = segmentSentenceTokens(sentence, localePreference)
  return {
    morphemes: tokensToMorphemes(tokens),
    locale,
    usedSegmenter,
  }
}

function regexTokenize(sentence: string): string[] {
  return (sentence.match(WORD_REGEX) ?? []).filter(Boolean)
}

function detectLocale(sentence: string, fallback: SegmenterLocale = 'en'): SegmenterLocale {
  if (HANGUL_REGEX.test(sentence)) return 'ko'
  return fallback
}

function segmentSentenceTokens(
  sentence: string,
  localePreference?: SegmenterLocale
): TokenizationResult {
  if (!sentence.trim()) {
    return { tokens: [], locale: localePreference ?? 'en', usedSegmenter: false }
  }

  const preferredLocale = localePreference ?? detectLocale(sentence)

  if (!hasSegmenterSupport) {
    return { tokens: regexTokenize(sentence), locale: preferredLocale, usedSegmenter: false }
  }

  const supportedLocales = Intl.Segmenter.supportedLocalesOf([preferredLocale, 'en'])
  if (supportedLocales.length === 0) {
    return { tokens: regexTokenize(sentence), locale: preferredLocale, usedSegmenter: false }
  }

  const resolvedLocale: SegmenterLocale = supportedLocales[0]?.toLowerCase().startsWith('ko')
    ? 'ko'
    : 'en'

  const segmenter = new Intl.Segmenter(resolvedLocale, { granularity: 'word' })
  const tokens: string[] = []

  for (const part of segmenter.segment(sentence)) {
    const { segment, isWordLike } = part

    if (!segment) continue
    if (!isWordLike) {
      if (!segment.trim()) continue
      tokens.push(...segment.split('').filter(Boolean))
      continue
    }

    tokens.push(segment)
  }

  return { tokens, locale: resolvedLocale, usedSegmenter: true }
}

function tokensToMorphemes(tokens: string[]): MorphemeMeta[] {
  const now = new Date().toISOString()
  return tokens.map(text => ({
    id: generateId('m'),
    text,
    createdAt: now,
    lastReviewedAt: null,
    vocabCount: 0,
    grammarCount: 0,
    tags: [],
    notes: [],
  }))
}

// ─────────────────────────────────────────────────────────────
// Text Joining
// ─────────────────────────────────────────────────────────────

/**
 * Smart-join morphemes respecting punctuation spacing rules.
 * Handles various punctuation types for proper spacing:
 * - No space before closing/terminal punctuation
 * - No space after opening punctuation
 */
export function smartJoinMorphemes(morphemes: MorphemeMeta[]): string {
  // No space before closing/terminal punctuation
  const noSpaceBefore = /^[,.;:!?…)\]}〉》」』】、。？！：；"'»›]+$/u
  // No space after opening punctuation
  const noSpaceAfterPrev = /^[([{\-–—"'【《〈「『«‹]+$/u

  let output = ''
  let prevText = ''

  for (const m of morphemes) {
    const t = m.text
    const addSpace = output.length > 0 && !noSpaceBefore.test(t) && !noSpaceAfterPrev.test(prevText)
    output += (addSpace ? ' ' : '') + t
    prevText = t
  }

  return output
}

// ─────────────────────────────────────────────────────────────
// Morpheme Operations
// ─────────────────────────────────────────────────────────────

/**
 * Break a morpheme at a specific character index.
 * Returns null if the operation would result in empty segments.
 */
export function breakMorphemeAt(
  morphemes: MorphemeMeta[],
  morphemeId: string,
  breakIndex: number
): MorphemeMeta[] | null {
  const morphemeIndex = morphemes.findIndex(m => m.id === morphemeId)
  if (morphemeIndex === -1) return null

  const morpheme = morphemes[morphemeIndex]!
  const beforeText = morpheme.text.substring(0, breakIndex).trim()
  const afterText = morpheme.text.substring(breakIndex).trim()

  // Don't allow break that results in empty segments
  if (!beforeText || !afterText) return null

  const now = new Date().toISOString()

  // Create new morpheme for the "after" portion
  const newMorpheme: MorphemeMeta = {
    id: generateId('m'),
    text: afterText,
    createdAt: now,
    lastReviewedAt: null,
    vocabCount: 0,
    grammarCount: 0,
    tags: [],
    notes: [],
  }

  // Update original morpheme with "before" portion
  const updatedMorpheme: MorphemeMeta = {
    ...morpheme,
    text: beforeText,
  }

  return [
    ...morphemes.slice(0, morphemeIndex),
    updatedMorpheme,
    newMorpheme,
    ...morphemes.slice(morphemeIndex + 1),
  ]
}

/**
 * Combine multiple morphemes into one.
 * Merges notes, vocab counts, and grammar counts.
 * Returns null if fewer than 2 valid morphemes are selected.
 */
export function combineMorphemesByIds(
  morphemes: MorphemeMeta[],
  morphemeIds: string[]
): MorphemeMeta[] | null {
  if (morphemeIds.length < 2) return null

  // Find indices of selected morphemes and sort them
  const indices = morphemeIds
    .map(id => morphemes.findIndex(m => m.id === id))
    .filter(idx => idx !== -1)
    .sort((a, b) => a - b)

  if (indices.length < 2) return null

  const idxFirst = indices[0]!
  const firstMorpheme = morphemes[idxFirst]!

  // Get all morphemes to combine and join their text
  const combinedText = indices.map(idx => morphemes[idx]!)
  const combinedJoined = smartJoinMorphemes(combinedText)

  // Merge all notes from combined morphemes
  const combinedNotes = indices.flatMap(idx => morphemes[idx]!.notes)
  const combinedVocabCount = indices.reduce((sum, idx) => sum + morphemes[idx]!.vocabCount, 0)
  const combinedGrammarCount = indices.reduce((sum, idx) => sum + morphemes[idx]!.grammarCount, 0)

  // Create combined morpheme (preserves first morpheme's id and timestamps)
  const combinedMorpheme: MorphemeMeta = {
    ...firstMorpheme,
    text: combinedJoined,
    notes: combinedNotes,
    vocabCount: combinedVocabCount,
    grammarCount: combinedGrammarCount,
  }

  const idxLast = indices[indices.length - 1]!

  return [...morphemes.slice(0, idxFirst), combinedMorpheme, ...morphemes.slice(idxLast + 1)]
}

/**
 * Edit the text of a specific morpheme.
 * Returns updated morphemes array and recalculated sentence.
 */
export function editMorphemeText(
  morphemes: MorphemeMeta[],
  morphemeId: string,
  newText: string
): { morphemes: MorphemeMeta[]; sentence: string } | null {
  const morphemeIndex = morphemes.findIndex(m => m.id === morphemeId)
  if (morphemeIndex === -1) return null

  const updatedMorphemes = morphemes.map(m => {
    if (m.id === morphemeId) {
      return {
        ...m,
        text: newText,
      }
    }
    return m
  })

  const sentence = smartJoinMorphemes(updatedMorphemes)

  return {
    morphemes: updatedMorphemes,
    sentence,
  }
}

/**
 * Insert a new morpheme to the left or right of a target morpheme.
 * Returns updated morphemes array and recalculated sentence.
 */
export function insertMorpheme(
  morphemes: MorphemeMeta[],
  position: 'left' | 'right',
  targetMorphemeId: string,
  newText: string
): { morphemes: MorphemeMeta[]; sentence: string } | null {
  const targetIndex = morphemes.findIndex(m => m.id === targetMorphemeId)
  if (targetIndex === -1) return null

  const now = new Date().toISOString()
  const newMorpheme: MorphemeMeta = {
    id: generateId('m'),
    text: newText,
    createdAt: now,
    lastReviewedAt: null,
    vocabCount: 0,
    grammarCount: 0,
    tags: [],
    notes: [],
  }

  const insertIndex = position === 'left' ? targetIndex : targetIndex + 1
  const updatedMorphemes = [
    ...morphemes.slice(0, insertIndex),
    newMorpheme,
    ...morphemes.slice(insertIndex),
  ]

  const sentence = smartJoinMorphemes(updatedMorphemes)

  return {
    morphemes: updatedMorphemes,
    sentence,
  }
}

// ─────────────────────────────────────────────────────────────
// Note Creation
// ─────────────────────────────────────────────────────────────

/**
 * Create a note payload for attachment to a morpheme.
 */
export function createNotePayload(
  payload:
    | { type: 'vocab'; target: string; native: string; pos?: PosTag; tags?: string[] }
    | { type: 'grammar'; text: string }
): Note {
  const now = new Date().toISOString()

  if (payload.type === 'vocab') {
    const vocabNote: Note = {
      id: generateId('n'),
      type: 'vocab',
      target: payload.target,
      native: payload.native,
      createdAt: now,
    }
    if (payload.pos) {
      vocabNote.pos = payload.pos
    }
    if (payload.tags?.length) {
      vocabNote.tags = payload.tags
    }
    return vocabNote
  }

  return {
    id: generateId('n'),
    type: 'grammar',
    text: payload.text,
    createdAt: now,
  }
}

/**
 * Add a note to a specific morpheme.
 * Returns updated morphemes array.
 */
export function addNoteToMorpheme(
  morphemes: MorphemeMeta[],
  morphemeId: string,
  payload:
    | { type: 'vocab'; target: string; native: string; pos?: PosTag; tags?: string[] }
    | { type: 'grammar'; text: string }
): MorphemeMeta[] {
  const note = createNotePayload(payload)

  return morphemes.map(m => {
    if (m.id === morphemeId) {
      const vocabCount = note.type === 'vocab' ? m.vocabCount + 1 : m.vocabCount
      const grammarCount = note.type === 'grammar' ? m.grammarCount + 1 : m.grammarCount
      return {
        ...m,
        notes: [...m.notes, note],
        vocabCount,
        grammarCount,
      }
    }
    return m
  })
}

// ─────────────────────────────────────────────────────────────
// Flow Visualization
// ─────────────────────────────────────────────────────────────

/**
 * Convert morphemes to flow nodes and edges for XYFlow visualization.
 */
export function morphemesToFlow(morphemes: MorphemeMeta[]): {
  nodes: FlowNode[]
  edges: FlowEdge[]
} {
  const nodes: FlowNode[] = morphemes.map((m, index) => ({
    id: m.id,
    position: {
      x: index * 140,
      y: 0,
    },
    data: {
      label: m.text,
    },
  }))

  const edges: FlowEdge[] = morphemes.slice(1).map((m, index) => ({
    id: `e-${morphemes[index]!.id}-${m.id}`,
    source: morphemes[index]!.id,
    target: m.id,
  }))

  return {
    nodes,
    edges,
  }
}
