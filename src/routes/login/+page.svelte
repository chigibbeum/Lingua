<script lang="ts">
  import LoginPage from '$lib/components/views/LoginPage.svelte'
  import { authReady, isLoggedIn } from '$lib/stores/auth'
  import { goto } from '$app/navigation'
  import { base } from '$app/paths'

  $effect(() => {
    console.log('[login] effect: authReady=', $authReady, 'isLoggedIn=', $isLoggedIn)
    if (!$authReady) return
    if ($isLoggedIn) {
      console.log('[login] redirecting to /home')
      goto(`${base}/home`, { replaceState: true })
    }
  })
</script>

{#if !$authReady}
  <div class="app-loading" aria-busy="true" aria-live="polite"></div>
{:else if $isLoggedIn}
  <div class="app-loading" aria-live="polite">Redirecting…</div>
{:else}
  <LoginPage />
{/if}

<style>
  .app-loading {
    min-height: 100vh;
    background-color: #222831;
  }
</style>
