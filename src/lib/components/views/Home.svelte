<script lang="ts">
  import Abc from '$lib/icons/Abc.svelte'
  import Flashcard from '$lib/icons/Flashcard.svelte'

  const noop = () => {}
  let {
    onNavigate = noop,
  }: {
    onNavigate?: (_route: 'parse' | 'flashcard') => void
  } = $props()

  const handleParseClick = () => onNavigate('parse')
  const handleFlashcardClick = () => onNavigate('flashcard')
</script>

<main class="home">
  <div class="icons-container">
    <button
      class="icon-button"
      type="button"
      onclick={handleParseClick}
      aria-label="Navigate to Parse Mode"
    >
      <Abc size={64} />
    </button>
    <button
      class="icon-button"
      type="button"
      onclick={handleFlashcardClick}
      aria-label="Navigate to Flashcard Mode"
    >
      <Flashcard size={64} />
    </button>
  </div>
</main>

<style>
  .home {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    padding: 2rem 1.5rem;
    background-color: #222831;
  }

  .icons-container {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    align-items: center;
  }

  .icon-button {
    width: 120px;
    height: 120px;
    display: grid;
    place-items: center;
    border: none;
    border-radius: 0.35rem;
    background-color: transparent;
    cursor: pointer;
    transition:
      transform 150ms ease,
      box-shadow 150ms ease,
      background-color 150ms ease;
  }

  .icon-button:hover,
  .icon-button:focus-visible {
    outline: none;
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
    background-color: #31363f;
  }

  @media (max-width: 640px) {
    .icons-container {
      flex-direction: column;
    }
  }
</style>
