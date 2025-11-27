/**
 * Authentication Utilities
 *
 * Centralized auth helpers used by all service modules.
 * Eliminates duplicate `requireUserId()` definitions across services.
 */
import { auth } from '$lib/firebase/client'

/**
 * Get the current user's UID or throw if not authenticated.
 * Use this in service functions that require authentication.
 */
export function requireUserId(): string {
  const current = auth?.currentUser
  if (!current?.uid) {
    throw new Error('Not authenticated')
  }
  return current.uid
}

/**
 * Get the current user's UID, or null if not authenticated.
 * Use this for optional auth checks.
 */
export function getUserId(): string | null {
  return auth?.currentUser?.uid ?? null
}

/**
 * Check if a user is currently authenticated.
 */
export function isAuthenticated(): boolean {
  return !!auth?.currentUser?.uid
}

