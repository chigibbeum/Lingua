/**
 * Toast Notification Store
 *
 * Provides a simple toast notification system for user feedback.
 * Replaces alert() calls throughout the application.
 *
 * Usage:
 *   import { toastStore } from '$lib/stores/toast'
 *   toastStore.success('Saved successfully!')
 *   toastStore.error('Failed to save')
 *   toastStore.info('Processing...')
 */
import { writable, derived } from 'svelte/store'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration: number
}

interface ToastState {
  toasts: Toast[]
}

const DEFAULT_DURATION = 4000

function createToastStore() {
  const { subscribe, update } = writable<ToastState>({ toasts: [] })

  let idCounter = 0

  function generateId(): string {
    return `toast-${++idCounter}-${Date.now()}`
  }

  function add(message: string, type: ToastType, duration = DEFAULT_DURATION): string {
    const id = generateId()
    const toast: Toast = { id, message, type, duration }

    update(state => ({
      toasts: [...state.toasts, toast],
    }))

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }

    return id
  }

  function dismiss(id: string): void {
    update(state => ({
      toasts: state.toasts.filter(t => t.id !== id),
    }))
  }

  function clear(): void {
    update(() => ({ toasts: [] }))
  }

  return {
    subscribe,

    /**
     * Show a success toast
     */
    success(message: string, duration = DEFAULT_DURATION): string {
      return add(message, 'success', duration)
    },

    /**
     * Show an error toast
     */
    error(message: string, duration = DEFAULT_DURATION): string {
      return add(message, 'error', duration)
    },

    /**
     * Show an info toast
     */
    info(message: string, duration = DEFAULT_DURATION): string {
      return add(message, 'info', duration)
    },

    /**
     * Show a warning toast
     */
    warning(message: string, duration = DEFAULT_DURATION): string {
      return add(message, 'warning', duration)
    },

    /**
     * Show a toast with custom type
     */
    show(message: string, type: ToastType = 'info', duration = DEFAULT_DURATION): string {
      return add(message, type, duration)
    },

    /**
     * Dismiss a specific toast by ID
     */
    dismiss,

    /**
     * Clear all toasts
     */
    clear,
  }
}

export const toastStore = createToastStore()

// Derived store for easy access to toasts array
export const toasts = derived(toastStore, $s => $s.toasts)

