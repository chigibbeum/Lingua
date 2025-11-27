import { writable } from 'svelte/store'
import type { PosChipFormat } from '../schemas/settings'

export type { PosChipFormat }

export const posChipFormat = writable<PosChipFormat>('short')
