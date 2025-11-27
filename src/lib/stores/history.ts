import { writable, derived, type Writable } from 'svelte/store'
import type { HistoryScope, HistoryAction, HistoryEntry } from '../schemas/history'

export type { HistoryScope, HistoryAction, HistoryEntry }

const STORAGE_KEY = 'lingua.history.session.v1'
const MAX_ENTRIES = 200

function generateId(prefix = 'h'): string {
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${Date.now().toString(36)}_${rand}`
}

function loadFromSession(): HistoryEntry[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.filter(Boolean)
    }
    return []
  } catch {
    return []
  }
}

function persistToSession(entries: HistoryEntry[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // ignore persistence failures (e.g., private mode)
  }
}

function createHistoryStore() {
  const baseStore: Writable<HistoryEntry[]> = writable(loadFromSession())

  // Persist on change
  baseStore.subscribe(entries => persistToSession(entries))

  const add = (
    entry: Omit<HistoryEntry, 'id' | 'timestamp'> & Partial<Pick<HistoryEntry, 'id' | 'timestamp'>>
  ) => {
    const optionalFields: Partial<Pick<HistoryEntry, 'description' | 'snippet' | 'relatedId'>> = {
}
    if (entry.description !== undefined) optionalFields.description = entry.description
    if (entry.snippet !== undefined) optionalFields.snippet = entry.snippet
    if (entry.relatedId !== undefined) optionalFields.relatedId = entry.relatedId

    const full: HistoryEntry = {
      id: entry.id ?? generateId(),
      timestamp: entry.timestamp ?? new Date().toISOString(),
      scope: entry.scope,
      action: entry.action,
      title: entry.title,
      pinned: entry.pinned ?? false,
      ...optionalFields,
    }
    baseStore.update(current => {
      const next = [full, ...current]
      if (next.length > MAX_ENTRIES) {
        // Keep pinned items preferentially by trimming from the end
        const trimmed = next.slice(0, MAX_ENTRIES)
        if (trimmed.length < next.length) {
          // no-op, we already truncated
        }
        return trimmed
      }
      return next
    })
  }

  const clearSession = () => {
    baseStore.set([])
  }

  const togglePin = (id: string) => {
    baseStore.update(list =>
      list.map(e =>
        e.id === id
          ? {
              ...e,
              pinned: !e.pinned,
            }
          : e
      )
    )
  }

  const remove = (id: string) => {
    baseStore.update(list => list.filter(e => e.id !== id))
  }

  const entries = derived(baseStore, v => v)

  const filtered = (scope: 'all' | HistoryScope) =>
    derived(baseStore, v => (scope === 'all' ? v : v.filter(e => e.scope === scope)))

  return {
    subscribe: baseStore.subscribe,
    add,
    clearSession,
    togglePin,
    remove,
    entries,
    filtered,
  }
}

export const historyStore = createHistoryStore()
