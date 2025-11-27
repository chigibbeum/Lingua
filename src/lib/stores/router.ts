import { writable } from 'svelte/store'
import type { AppRoute } from '../schemas/router'

export type { AppRoute }

export const currentRoute = writable<AppRoute>('landing')
