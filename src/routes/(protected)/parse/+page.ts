import type { PageLoad } from './$types'
import { get } from 'svelte/store'
import { sessionStore } from '$lib/stores/session'

export const ssr = false
export const prerender = false

export const load = (async () => {
  const sessionSnapshot = get(sessionStore)

  return {
    sessionSnapshot,
  }
}) satisfies PageLoad


