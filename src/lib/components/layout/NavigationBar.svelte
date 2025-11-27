<script lang="ts">
  import Open from '$lib/icons/Open.svelte'
  import Collapse from '$lib/icons/Collapse.svelte'
  import SentenceLibrary from '$lib/icons/SentenceLibrary.svelte'
  import DeckLibrary from '$lib/icons/DeckLibrary.svelte'
  import Settings from '$lib/icons/Settings.svelte'
  import HowToUse from '$lib/icons/HowToUse.svelte'
  import LoginIcon from '$lib/icons/Login.svelte'
  import HowToUseModal from '../modals/HowToUseModal.svelte'
  import HomeIcon from '$lib/icons/HomeIcon.svelte'
  import { isLoggedIn, logout } from '$lib/stores/auth'
  import { goto } from '$app/navigation'
  import { base } from '$app/paths'

  let isExpanded = $state(false)
  let showHowToUseModal = $state(false)
  let {
    onOpenSentences = () => {},
    onOpenDecks = () => {},
    onOpenSettings = () => {},
  }: {
    onOpenSentences?: () => void
    onOpenDecks?: () => void
    onOpenSettings?: () => void
  } = $props()
  let isAuthActionBusy = $state(false)
  const navigateTo = (path: string) => goto(`${base}${path}`)

  function toggleExpanded() {
    isExpanded = !isExpanded
  }

  async function handleAuthClick() {
    if ($isLoggedIn) {
      if (isAuthActionBusy) return
      isAuthActionBusy = true
      try {
        await logout()
        navigateTo('/landing')
      } catch (err) {
        console.error('[NavigationBar] Failed to log out', err)
      } finally {
        isAuthActionBusy = false
      }
    } else {
      navigateTo('/login')
    }
  }
</script>

<nav class="navigation-bar" aria-label="Main navigation">
  <div class="nav-content">
    <!-- Left side: Dashboard toggle -->
    <button
      class="nav-item dashboard-toggle"
      type="button"
      onclick={toggleExpanded}
      aria-label={isExpanded ? 'Collapse navigation' : 'Expand navigation'}
    >
      {#if isExpanded}
        <Collapse size={24} stroke="var(--lingua-text-primary)" strokeWidth={1.5} />
      {:else}
        <Open size={24} stroke="var(--lingua-text-primary)" strokeWidth={1.5} />
      {/if}
      {#if isExpanded}
        <span class="nav-label">Dashboard</span>
      {/if}
    </button>

    <!-- Center: Main navigation items - centered when expanded -->
    <div class="nav-center">
      <button
        class="nav-item"
        type="button"
        aria-label="Home"
        onclick={() => navigateTo('/home')}
      >
        <HomeIcon size={24} stroke="var(--lingua-text-primary)" fill="none" strokeWidth={1.5} ariaLabel="Home" />
        {#if isExpanded}
          <span class="nav-label">Home</span>
        {/if}
      </button>

      <div class="divider"></div>

      <button
        class="nav-item"
        type="button"
        aria-label="Sentence Library"
        onclick={onOpenSentences}
      >
        <SentenceLibrary size={24} stroke="var(--lingua-text-primary)" strokeWidth={1.5} />
        {#if isExpanded}
          <span class="nav-label">Sentences</span>
        {/if}
      </button>

      <div class="divider"></div>

      <button class="nav-item" type="button" aria-label="Deck Library" onclick={onOpenDecks}>
        <DeckLibrary size={24} stroke="var(--lingua-text-primary)" strokeWidth={1.5} />
        {#if isExpanded}
          <span class="nav-label">Decks</span>
        {/if}
      </button>

      <div class="divider"></div>

      <button class="nav-item" type="button" aria-label="Settings" onclick={onOpenSettings}>
        <Settings size={24} stroke="var(--lingua-text-primary)" strokeWidth={1.5} />
        {#if isExpanded}
          <span class="nav-label">Settings</span>
        {/if}
      </button>

      <div class="divider"></div>

      <button
        class="nav-item"
        type="button"
        aria-label="How To Use"
        onclick={() => (showHowToUseModal = true)}
      >
        <HowToUse size={24} stroke="var(--lingua-text-primary)" strokeWidth={1.5} />
        {#if isExpanded}
          <span class="nav-label">How To Use</span>
        {/if}
      </button>
    </div>

    <!-- Right side: Login/Logout -->
    <button
      class="nav-item login-button"
      type="button"
      aria-label={$isLoggedIn ? 'Logout' : 'Login'}
      aria-busy={isAuthActionBusy}
      disabled={isAuthActionBusy}
      onclick={handleAuthClick}
    >
      <LoginIcon
        size={24}
        stroke="var(--lingua-text-primary)"
        strokeWidth={1.5}
        ariaLabel={$isLoggedIn ? 'Logout' : 'Login'}
      />
      {#if isExpanded}
        <span class="nav-label">{$isLoggedIn ? 'Logout' : 'Login'}</span>
      {/if}
    </button>
  </div>
</nav>

<HowToUseModal open={showHowToUseModal} onClose={() => (showHowToUseModal = false)} />

<style>
  .navigation-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    background-color: var(--lingua-bg-section);
    z-index: 1000;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .nav-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    max-width: 100%;
    position: relative;
  }

  .dashboard-toggle {
    position: absolute;
    left: 1rem;
  }

  .login-button {
    position: absolute;
    right: 1rem;
  }

  .nav-center {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 1rem;
    margin: 0 auto;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
    border: none;
    padding: 0.5rem;
    border-radius: 8px;
    color: var(--lingua-text-secondary);
    cursor: pointer;
    transition: background-color 0.2s;
    white-space: nowrap;
  }

  .nav-item:hover,
  .nav-item:focus-visible {
    outline: none;
    background-color: rgba(65, 87, 128, 0.2);
    box-shadow: 0 0 0 2px rgba(65, 87, 128, 0.4) inset;
  }

  .nav-label {
    color: var(--lingua-text-secondary);
    font-size: 0.9rem;
    margin-left: 0.25rem;
  }

  .divider {
    width: 1px;
    height: 24px;
    background-color: var(--lingua-divider);
    opacity: 0.5;
  }
</style>
