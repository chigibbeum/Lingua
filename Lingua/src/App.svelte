<script lang="ts">
  import Home from '@lib/Home.svelte'
  import ParseMode from '@lib/ParseMode.svelte'
  import FlashcardMode from '@lib/FlashcardMode.svelte'
  import LandingPage from '@lib/LandingPage.svelte'
  import LoginPage from '@lib/LoginPage.svelte'
  import { currentRoute } from '@lib/stores/router'
  
  type Route = 'landing' | 'home' | 'parse' | 'flashcard' | 'login'
  
  function handleNavigate(route: 'parse' | 'flashcard') {
    currentRoute.set(route)
  }
  
  function handleModeChange(mode: 'parsing' | 'flashcard') {
    if (mode === 'parsing') {
      currentRoute.set('parse')
    } else {
      currentRoute.set('flashcard')
    }
  }
 </script>

{#if $currentRoute === 'landing'}
  <LandingPage />
{:else if $currentRoute === 'home'}
  <Home onNavigate={handleNavigate} />
{:else if $currentRoute === 'parse'}
  <ParseMode mode="parsing" onModeChange={handleModeChange} />
{:else if $currentRoute === 'flashcard'}
  <FlashcardMode mode="flashcard" onModeChange={handleModeChange} />
{:else if $currentRoute === 'login'}
  <LoginPage />
{/if}