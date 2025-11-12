import { writable } from 'svelte/store'

export type PosChipFormat = 'short' | 'full' | 'hidden'

export const posChipFormat = writable<PosChipFormat>('short')


