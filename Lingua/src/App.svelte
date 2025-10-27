<script lang="ts">
  import { onMount } from 'svelte'
  import NavBar from './lib/NavBar.svelte'
  import Home from './lib/Home.svelte'
  import Create from './lib/Create.svelte'

  let route: 'home' | 'create' = 'home'

  function updateRouteFromHash() {
    route = location.hash === '#/create' ? 'create' : 'home'
  }

  onMount(() => {
    updateRouteFromHash()
    const listener = () => updateRouteFromHash()
    window.addEventListener('hashchange', listener)
    return () => window.removeEventListener('hashchange', listener)
  })
</script>

<NavBar />

{#if route === 'home'}
  <Home />
{:else if route === 'create'}
  <Create />
{/if}

