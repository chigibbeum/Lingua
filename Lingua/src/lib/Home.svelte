<script lang="ts">
  import { sessionStore } from './stores/session'
  import { SvelteFlow } from '@xyflow/svelte'
  import { get } from 'svelte/store'
  import Toolbar from './Toolbar.svelte'

  let sentenceLocal: string = ''

  function confirmText() {
    sessionStore.updateSentence(sentenceLocal)
    sessionStore.beginParse()
  }
  function startNewIfNeeded() {
    const state = get(sessionStore)
    if (!state.current) {
      sessionStore.startNew()
    }
  }
  function onInput(e: Event) {
    sentenceLocal = (e.target as HTMLTextAreaElement).value
    sessionStore.updateSentence(sentenceLocal)
  }
</script>

<main class="home">
  <Toolbar />
  <section class="canvas" aria-label="Text entry">
    <div class="floating-box" role="group" aria-label="Text editor">
      <textarea
        class="floating-input"
        placeholder="Add new text..."
        bind:value={sentenceLocal}
        on:focus={startNewIfNeeded}
        on:input={onInput}
        rows="5"
      ></textarea>
      <div class="actions">
        <button type="button" on:click={confirmText}>confirm</button>
      </div>
    </div>
  </section>

  {#if $sessionStore.mode === 'parsing' && $sessionStore.current}
    <section class="parser" aria-label="Parsing canvas">
      <div class="flow-wrapper">
        <SvelteFlow nodes={$sessionStore.current.nodes} edges={$sessionStore.current.edges} />
      </div>
    </section>
  {/if}
</main>

<style>
  .home {
    min-height: calc(100vh - 56px);
    display: grid;
    place-items: center;
    padding: 1.5rem 1rem;
  }
  .canvas {
    width: min(900px, 92vw);
    display: grid;
    place-items: center;
  }
  .floating-box {
    width: 100%;
    background-color: #31363f; /* § 3.1 Section background */
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
    display: grid;
    gap: 0.75rem;
  }
  .floating-input {
    width: 100%;
    background: #31363f;
    color: #eeeeee;
    border-radius: 10px;
    border: 1px solid transparent;
    padding: 0.75rem 0.9rem;
    resize: vertical;
    min-height: 120px;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  }
  .floating-input::placeholder {
    color: #eeeeee;
    opacity: 0.6;
  }
  .floating-input:focus {
    box-shadow: inset 0 0 0 2px #415780; /* § 3.1 Button hover as focus */
    outline: none;
  }
  .actions {
    display: flex;
    justify-content: end;
  }
  .parser {
    width: min(1100px, 96vw);
    margin-top: 1rem;
    background-color: #31363f;
    border-radius: 12px;
    padding: 0.5rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
  }
  .flow-wrapper {
    height: 420px;
  }
</style>
