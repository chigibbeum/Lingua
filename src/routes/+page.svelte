<script lang="ts">
import Home from '@lib/Home.svelte';
import ParseMode from '@lib/ParseMode.svelte';
import FlashcardMode from '@lib/FlashcardMode.svelte';
import LandingPage from '@lib/LandingPage.svelte';
import LoginPage from '@lib/LoginPage.svelte'
import { currentRoute } from '@lib/stores/router'
import { isLoggedIn, authReady } from '@lib/stores/auth'

function handleNavigate(route: 'parse' | 'flashcard') {
  console.warn('[App] navigate to', route)
  currentRoute.set(route)
}

  function handleModeChange(mode: 'parsing' | 'flashcard') {
    if (mode === 'parsing') {
    console.warn('[App] mode change -> parsing, routing to parse')
      currentRoute.set('parse')
    } else {
    console.warn('[App] mode change -> flashcard, routing to flashcard')
      currentRoute.set('flashcard')
    }
  }

  // Redirect based on auth state on load and when it changes
  $effect(() => {
    if (!$authReady) return
    if ($isLoggedIn) {
      if ($currentRoute === 'landing' || $currentRoute === 'login') {
        currentRoute.set('home')
      }
    } else {
      if ($currentRoute !== 'login' && $currentRoute !== 'landing') {
        currentRoute.set('landing')
      }
    }
  })
</script>

{#if !$authReady}
  <div class="app-loading" aria-busy="true"></div>
{:else if $currentRoute === 'landing'}
  <LandingPage />
{:else if $currentRoute === 'home'}
  <Home onNavigate={handleNavigate} />
{:else if $currentRoute === 'parse'}
  <ParseMode mode="parsing" onModeChange={handleModeChange} />
{:else if $currentRoute === 'flashcard'}
  <FlashcardMode mode="flashcard" onModeChange={handleModeChange} />
{:else if $currentRoute === 'login'}
  <LoginPage />
{:else}
  <div class="app-loading" aria-live="polite">Unknown route: {$currentRoute}</div>
{/if}

<style>
  .app-loading {
    min-height: 100vh;
    background-color: #222831;
  }
  @media (prefers-color-scheme: light) {
    .app-loading {
      background-color: #ffffff;
    }
  }
</style>

