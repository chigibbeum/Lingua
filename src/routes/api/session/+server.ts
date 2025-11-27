import type { RequestHandler } from './$types'
import { json, type Cookies } from '@sveltejs/kit'
import { adminAuth } from '$lib/firebase/admin'
import { SESSION_COOKIE, decodeJwtClaims, isSecureRequest } from '$lib/server/auth/session'

const SESSION_MAX_AGE = 60 * 60 * 24 * 14 // 14 days in seconds
const isDevEnvironment = process.env.NODE_ENV !== 'production'

export const POST: RequestHandler = async ({ request, cookies }) => {
  const body = await request.json().catch(() => null)
  const idToken = body?.idToken
  if (typeof idToken !== 'string' || !idToken) {
    return json(
      {
        error: 'idToken required',
      },
      {
        status: 400,
      }
    )
  }

  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isSecureRequest(request),
    path: '/',
  }

  if (!adminAuth) {
    const devResponse = trySetDevSessionCookie({
      cookies,
      idToken,
      request,
      reason: 'Admin SDK not configured; using insecure dev cookie',
      cookieOptions,
    })
    if (devResponse) {
      return devResponse
    }
    return json(
      {
        error: 'Invalid token',
      },
      {
        status: 401,
      }
    )
  }

  try {
    await adminAuth.verifyIdToken(idToken)
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE * 1000,
    })

    cookies.set(SESSION_COOKIE, sessionCookie, {
      ...cookieOptions,
      maxAge: SESSION_MAX_AGE,
    })

    return json({
      status: 'ok',
      mode: 'server',
    })
  } catch (error) {
    console.error('[api/session] Failed to create session cookie', error)
    if (isDevEnvironment) {
      const fallbackResponse = trySetDevSessionCookie({
        cookies,
        idToken,
        request,
        reason: 'Admin SDK error; falling back to insecure dev cookie',
        cookieOptions,
      })
      if (fallbackResponse) {
        return fallbackResponse
      }
    }

    return json(
      {
        error: 'Invalid token',
      },
      {
        status: 401,
      }
    )
  }
}

export const DELETE: RequestHandler = async ({ request, cookies }) => {
  cookies.delete(SESSION_COOKIE, {
    path: '/',
    secure: isSecureRequest(request),
  })
  if (!adminAuth) {
    console.warn('[api/session] Admin SDK not configured; nothing to revoke server-side')
    return json({
      status: 'cleared',
    })
  }

  return json({
    status: 'cleared',
  })
}

type DevCookieOptions = {
  cookies: Cookies
  idToken: string
  request: Request
  reason: string
  cookieOptions: {
    httpOnly: boolean
    sameSite: 'lax'
    secure: boolean
    path: string
  }
}

function trySetDevSessionCookie({
  cookies,
  idToken,
  request,
  reason,
  cookieOptions,
}: DevCookieOptions) {
  const claims = decodeJwtClaims(idToken)
  if (!claims?.uid || !claims.exp) {
    return null
  }

  const now = Math.floor(Date.now() / 1000)
  const secondsLeft = claims.exp - now
  if (secondsLeft <= 0) {
    return null
  }

  cookies.set(SESSION_COOKIE, idToken, {
    ...cookieOptions,
    secure: isSecureRequest(request),
    maxAge: Math.min(SESSION_MAX_AGE, secondsLeft),
  })

  console.warn(`[api/session] ${reason}`)
  return json({
    status: 'ok',
    mode: 'dev',
  })
}
