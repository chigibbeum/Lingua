import type { PageLoad } from './$types'
import { get } from 'svelte/store'
import { historyStore } from '$lib/stores/history'
import { listFlashcards, type Flashcard } from '$lib/services/flashcardService'

export const ssr = false
export const prerender = false

export const load = (async () => {
  const flashHistory = get(historyStore)
    .filter(entry => entry.scope === 'flashcard')
    .slice(0, 12)

  let flashcards: Flashcard[] = []
  try {
    flashcards = await listFlashcards()
  } catch (error) {
    console.warn('[routes/(protected)/flashcard] Failed to hydrate flashcards', error)
  }

  return {
    flashHistory,
    flashcards,
  }
}) satisfies PageLoad


