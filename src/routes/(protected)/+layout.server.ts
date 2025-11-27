import { redirect } from '@sveltejs/kit'
import { base } from '$app/paths'
import type { LayoutServerLoad } from './$types'

export const prerender = false

export const load = (async ({ locals }) => {
  if (!locals.uid) {
    throw redirect(302, `${base}/landing`)
  }

  return {
    serverUser: locals.user,
    settings: locals.settings,
  }
}) satisfies LayoutServerLoad

