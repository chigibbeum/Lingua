<script lang="ts">
  import Open from '../icons/Open.svelte'
  import Collapse from '../icons/Collapse.svelte'
  import SentenceLibrary from '../icons/SentenceLibrary.svelte'
  import DeckLibrary from '../icons/DeckLibrary.svelte'
  import Settings from '../icons/Settings.svelte'
  import HowToUse from '../icons/HowToUse.svelte'
  import ProfileIcon from '../icons/ProfileIcon.svelte'
  
  let isExpanded = $state(false)
  let {
    onOpenSentences = () => {},
    onOpenProfile = () => {},
  }: {
    onOpenSentences?: () => void
    onOpenProfile?: () => void
  } = $props()
  
  function toggleExpanded() {
    isExpanded = !isExpanded
  }

  async function handleAuthClick() {
    onOpenProfile()
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
        <Collapse size={24} stroke="#76abae" strokeWidth={1.5} />
      {:else}
        <Open size={24} stroke="#76abae" strokeWidth={1.5} />
      {/if}
      {#if isExpanded}
        <span class="nav-label">Dashboard</span>
      {/if}
    </button>
    
    <!-- Center: Main navigation items - centered when expanded -->
    <div class="nav-center">
      <button class="nav-item" type="button" aria-label="Sentence Library" onclick={onOpenSentences}>
        <SentenceLibrary size={24} stroke="#76abae" strokeWidth={1.5} />
        {#if isExpanded}
          <span class="nav-label">Sentences</span>
        {/if}
      </button>
      
      <div class="divider"></div>
      
      <button class="nav-item" type="button" aria-label="Deck Library">
        <DeckLibrary size={24} stroke="#76abae" strokeWidth={1.5} />
        {#if isExpanded}
          <span class="nav-label">Decks</span>
        {/if}
      </button>
      
      <div class="divider"></div>
      
      <button class="nav-item" type="button" aria-label="Settings">
        <Settings size={24} stroke="#76abae" strokeWidth={1.5} />
        {#if isExpanded}
          <span class="nav-label">Settings</span>
        {/if}
      </button>
      
      <div class="divider"></div>
      
      <button class="nav-item" type="button" aria-label="How To Use">
        <HowToUse size={24} stroke="#76abae" strokeWidth={1.5} />
        {#if isExpanded}
          <span class="nav-label">How To Use</span>
        {/if}
      </button>
    </div>
    
    <!-- Right side: Profile -->
    <button 
      class="nav-item login-button" 
      type="button"
      aria-label={'Profile'}
      onclick={handleAuthClick}
    >
      <ProfileIcon size={24} stroke="#76abae" strokeWidth={1.5} />
      {#if isExpanded}
        <span class="nav-label">Profile</span>
      {/if}
    </button>
  </div>
</nav>

<style>
  .navigation-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    background-color: #31363f;
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
    color: #eeeeee;
    cursor: pointer;
    transition: background-color 0.2s;
    white-space: nowrap;
  }
  
  .nav-item:hover,
  .nav-item:focus-visible {
    outline: none;
    background-color: rgba(65, 87, 128, 0.2);
    box-shadow: 0 0 0 2px #41578066 inset;
  }
  
  .nav-label {
    color: #eeeeee;
    font-size: 0.9rem;
    margin-left: 0.25rem;
  }
  
  .divider {
    width: 1px;
    height: 24px;
    background-color: #eeeeee;
    opacity: 0.5;
  }
</style>

