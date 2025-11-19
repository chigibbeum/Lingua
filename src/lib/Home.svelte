<script lang="ts">
  import Abc from '../icons/Abc.svelte'
  import Flashcard from '../icons/Flashcard.svelte'

  const noop = () => {}
let { onNavigate = noop }: { onNavigate?: (_route: 'parse' | 'flashcard') => void } = $props()

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
