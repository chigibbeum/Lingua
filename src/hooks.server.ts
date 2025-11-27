import { json, redirect, type Handle } from '@sveltejs/kit'

import { SESSION_COOKIE, verifySessionCookie } from '$lib/server/auth/session'

const PUBLIC_UI_PREFIXES = [
  '/',
  '/landing',
  '/login',
  '/register',
  '/logout',
  '/email-action',
  '/pricing',
  '/terms',
  '/privacy',
]

const PUBLIC_API_PREFIXES = ['/api/session', '/api/auth', '/api/verification']

const ASSET_PREFIXES = ['/_app', '/build', '/static', '/fonts']
const ASSET_PATHS = new Set(['/favicon.ico', '/favicon.svg'])

const isAssetPath = (path: string): boolean =>
  ASSET_PREFIXES.some(prefix => path.startsWith(prefix)) || ASSET_PATHS.has(path)

const isPublicUi = (path: string): boolean =>
  PUBLIC_UI_PREFIXES.some(prefix => path === prefix || path.startsWith(`${prefix}/`))

const isPublicApi = (path: string): boolean =>
  PUBLIC_API_PREFIXES.some(prefix => path === prefix || path.startsWith(`${prefix}/`))

const unauthenticatedResponse = () =>
  json(
    {
      code: 'UNAUTHENTICATED',
    },
    {
      status: 401,
    }
  )

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.uid = null
  event.locals.user = null
  event.locals.settings = null

  const path = event.url.pathname
  const sessionCookie = event.cookies.get(SESSION_COOKIE)

  if (sessionCookie) {
    const verification = await verifySessionCookie(sessionCookie)
    if (verification.valid) {
      event.locals.uid = verification.uid
      event.locals.user = verification.user
      event.locals.settings = verification.settings
    } else {
      event.cookies.delete(SESSION_COOKIE, {
        path: '/',
      })
      event.locals.uid = null
      event.locals.user = null
      event.locals.settings = null
    }
  }

  const allowRequest =
    isAssetPath(path) || isPublicUi(path) || isPublicApi(path) || Boolean(event.locals.uid)

  if (!allowRequest) {
    if (path.startsWith('/api/')) {
      return unauthenticatedResponse()
    }
    throw redirect(302, `/login?redirect=${encodeURIComponent(path)}`)
  }

  return resolve(event)
}
