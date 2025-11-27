<script lang="ts">
  import { authReady, isLoggedIn } from '$lib/stores/auth'
  import { goto } from '$app/navigation'
  import { base } from '$app/paths'

  let { children } = $props()

  let redirectHandle: ReturnType<typeof setTimeout> | null = null

  $effect(() => {
    if (redirectHandle) {
      clearTimeout(redirectHandle)
      redirectHandle = null
    }

    if (typeof window === 'undefined') return
    if (!$authReady) return
    if ($isLoggedIn) return

    redirectHandle = setTimeout(() => {
      goto(`${base}/landing`, { replaceState: true })
    }, 200)

    return () => {
      if (redirectHandle) {
        clearTimeout(redirectHandle)
        redirectHandle = null
      }
    }
  })
</script>

{#if !$authReady}
  <div class="app-loading" aria-busy="true" aria-live="polite"></div>
{:else if !$isLoggedIn}
  <div class="app-loading" aria-live="assertive">Redirecting…</div>
{:else}
  {@render children()}
{/if}

<style>
  .app-loading {
    min-height: 100vh;
    background-color: #222831;
  }
</style>


