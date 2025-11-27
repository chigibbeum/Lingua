<script lang="ts">
  import '../app.css'
  import '@xyflow/svelte/dist/style.css'
  import '../lib/firebase/client'
  import Toast from '$lib/components/ui/Toast.svelte'

  let { children } = $props()
</script>

{@render children()}
<Toast />
