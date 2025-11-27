import type { PageLoad } from './$types'
import { get } from 'svelte/store'
import { sessionStore } from '$lib/stores/session'
import { historyStore } from '$lib/stores/history'
import { posChipFormat } from '$lib/stores/settings'
import type { DashboardSnapshot } from '$lib/schemas/dashboard'

export const ssr = false
export const prerender = false

export const load = (() => {
  const session = get(sessionStore)
  const history = get(historyStore)
  const posFormat = get(posChipFormat)

  const parseSessions = history.filter(entry => entry.scope === 'parse').length
  const flashcardReviews = history.filter(entry => entry.scope === 'flashcard').length

  const dashboard: DashboardSnapshot = {
    activeMode: session.mode,
    totals: {
      parseSessions,
      flashcardReviews,
    },
    recentHistory: history.slice(0, 5),
    preferences: {
      posChipFormat: posFormat,
    },
  }

  return {
    dashboard,
  }
}) satisfies PageLoad


