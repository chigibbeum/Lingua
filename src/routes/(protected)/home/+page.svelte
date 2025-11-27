<script lang="ts">
  import Home from '$lib/components/views/Home.svelte'
  import { goto } from '$app/navigation'
  import { base } from '$app/paths'
  import type { PageData } from './$types'

  export let data: PageData

  function handleNavigate(route: 'parse' | 'flashcard') {
    const target = route === 'parse' ? '/parse' : '/flashcard'
    goto(`${base}${target}`)
  }
</script>

<Home onNavigate={handleNavigate} dashboard={data.dashboard} />


