/**
 * Formatting Utilities
 *
 * Centralized formatting functions used across components.
 * Eliminates duplicate formatting logic in components.
 */

/**
 * Format an ISO timestamp string to a short date (e.g., "Nov 26").
 * Returns empty string for invalid/missing input.
 */
export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const parsed = Date.parse(iso)
  if (Number.isNaN(parsed)) return ''
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(parsed))
}

/**
 * Format an ISO timestamp string to a full locale string.
 * Returns empty string for invalid/missing input.
 */
export function formatFullDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : d.toLocaleString()
}

/**
 * Format a timestamp (ms or ISO string) to locale string.
 * Handles both number (ms) and string (ISO) inputs.
 */
export function formatTimestamp(value: string | number | null | undefined): string {
  if (!value) return ''
  const d = typeof value === 'number' ? new Date(value) : new Date(value)
  return isNaN(d.getTime()) ? '' : d.toLocaleString()
}

/**
 * Part of speech short forms for compact display.
 */
export const posShortForms: Record<string, string> = {
  noun: 'N',
  verb: 'V',
  adjective: 'Adj',
  adverb: 'Adv',
  preposition: 'Prep',
  pronoun: 'Pron',
  conjunction: 'Conj',
  particle: 'Part',
  auxiliary: 'Aux',
  classifier: 'CL',
  proper_noun: 'PropN',
  numeral: 'Num',
  expression: 'Expr',
  other: 'Other',
}

/**
 * Format a part of speech tag to short or long form.
 */
export function formatPos(pos: string, short = false): string {
  if (short) {
    return posShortForms[pos] ?? pos
  }
  return pos
}

