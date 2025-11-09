<script lang="ts">
  import Abc from '../icons/Abc.svelte'
  import Flashcard from '../icons/Flashcard.svelte'
  
  let { onNavigate }: { onNavigate: (route: 'parse' | 'flashcard') => void } = $props()
</script>

<main class="home">
  <div class="icons-container">
    <button 
      class="icon-button" 
      type="button"
      onclick={() => onNavigate('parse')}
      aria-label="Navigate to Parse Mode"
    >
      <Abc size={64} />
    </button>
    <button 
      class="icon-button" 
      type="button"
      onclick={() => onNavigate('flashcard')}
      aria-label="Navigate to Flashcard Mode"
    >
      <Flashcard size={64} />
    </button>
  </div>
</main>

<style>
  .home {
    min-height: calc(100vh - 56px);
    display: grid;
    place-items: center;
    padding: 1.5rem 1rem;
  }
  
  .icons-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    place-items: center;
  }
  
  .icon-button {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 1rem;
    border-radius: 12px;
    transition: background-color 0.2s;
    color: #eeeeee;
  }
  
  .icon-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .icon-button:focus {
    outline: 2px solid #415780;
    outline-offset: 2px;
  }
</style>
