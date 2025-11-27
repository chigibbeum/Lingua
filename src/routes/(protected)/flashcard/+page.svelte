<script lang="ts">
  import FlashcardMode from '$lib/components/modes/FlashcardMode.svelte'
  import { goto } from '$app/navigation'
  import { base } from '$app/paths'
  import type { PageData } from './$types'

  export let data: PageData

  function handleModeChange(mode: 'parsing' | 'flashcard') {
    if (mode === 'parsing') {
      goto(`${base}/parse`)
    }
  }
</script>

<FlashcardMode
  mode="flashcard"
  onModeChange={handleModeChange}
  initialCards={data.flashcards}
  historySnapshot={data.flashHistory}
/>


