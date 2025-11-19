import { writable } from 'svelte/store'

export type AppRoute = 'landing' | 'home' | 'parse' | 'flashcard' | 'login'

export const currentRoute = writable<AppRoute>('landing')
