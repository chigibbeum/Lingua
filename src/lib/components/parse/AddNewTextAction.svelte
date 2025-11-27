<script lang="ts">
  import { get } from 'svelte/store'
  import { sessionStore, type SessionState } from '$lib/stores/session'

  let textInput: HTMLInputElement | null = $state(null)
  let inputValue = $state('')
  let session = $state<SessionState>(get(sessionStore))

  // Derive showSubmit from inputValue
  const showSubmit = $derived(inputValue.trim().length > 0)

  // Subscribe to store changes
  $effect(() => {
    const unsubscribe = sessionStore.subscribe(state => {
      session = state
      // Sync input value when entering editing mode with existing sentence
      if (state.mode === 'editing' && state.current?.sentence && inputValue !== state.current.sentence) {
        inputValue = state.current.sentence
      } else if (state.mode !== 'editing' && inputValue !== '') {
        // Clear input when leaving editing mode
        inputValue = ''
      }
    })
    return unsubscribe
  })

  // Focus input when entering editing mode
  $effect(() => {
    if (session.mode === 'editing' && textInput) {
      // Use queueMicrotask for cleaner async without setTimeout
      queueMicrotask(() => textInput?.focus())
    }
  })

  function handleInput() {
    sessionStore.updateSentence(inputValue)
  }

  function handleSubmit() {
    if (inputValue.trim().length > 0) {
      sessionStore.beginParse()
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }
</script>

<div class="add-new-text-action">
  <div class="input-container">
    <input
      bind:this={textInput}
      type="text"
      bind:value={inputValue}
      oninput={handleInput}
      onkeydown={handleKeydown}
      placeholder="insert text"
      class="text-input"
      aria-label="Enter text to parse"
    />
    {#if showSubmit}
      <button type="button" onclick={handleSubmit} class="submit-button" aria-label="Submit text">
        submit
      </button>
    {/if}
  </div>
</div>

<style>
  .add-new-text-action {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    width: 100%;
    padding: 2rem;
    background-color: #222831;
  }

  .input-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
    max-width: 800px;
  }

  .text-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #eeeeee;
    font-size: 1.5rem;
    padding: 0.5rem 0;
    caret-color: #eeeeee;
  }

  .text-input::placeholder {
    color: #76abae;
    opacity: 0.6;
  }

  .submit-button {
    background: transparent;
    border: 2px solid #76abae;
    color: #eeeeee;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-radius: 0.35rem;
    transition:
      background-color 0.2s,
      border-color 0.2s;
  }

  .submit-button:hover {
    background-color: #31363f;
  }

  .submit-button:focus-visible {
    outline: 2px solid #76abae;
    outline-offset: 2px;
  }
</style>
