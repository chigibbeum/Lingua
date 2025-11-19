<script lang="ts">
	import '../app.css';
	import '@xyflow/svelte/dist/style.css';
	import '../lib/firebase';

	let { children } = $props();
</script>

{@render children()}

