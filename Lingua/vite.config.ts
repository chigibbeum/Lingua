import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { fileURLToPath } from 'node:url'
import { URL } from 'node:url'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: '/Lingua/',
  resolve: {
    alias: {
      '@icons': fileURLToPath(new URL('./src/icons', import.meta.url)),
      '@lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
      '$lib': path.resolve('./src/lib'),
    },
  },
})
