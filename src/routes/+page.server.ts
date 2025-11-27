import type { PageServerLoad } from './$types'
import { redirect } from '@sveltejs/kit'

export const load = (({ locals }) => {
  const destination = locals.uid ? '/home' : '/landing'
  throw redirect(302, destination)
}) satisfies PageServerLoad
