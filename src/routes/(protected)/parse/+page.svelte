<script lang="ts">
  import ParseMode from '$lib/components/modes/ParseMode.svelte'
  import { goto } from '$app/navigation'
  import { base } from '$app/paths'
  import type { PageData } from './$types'

  export let data: PageData

  function handleModeChange(mode: 'parsing' | 'flashcard') {
    if (mode === 'flashcard') {
      goto(`${base}/flashcard`)
    }
  }
</script>

<ParseMode
  mode="parsing"
  onModeChange={handleModeChange}
  initialSession={data.sessionSnapshot}
/>


