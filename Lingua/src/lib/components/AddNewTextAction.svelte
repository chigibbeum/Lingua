<script lang="ts">
  import { sessionStore } from '@lib/stores/session'
  import type { SessionState } from '@lib/stores/session'
  
  let textInput: HTMLInputElement | null = $state(null)
  let inputValue = $state('')
  let showSubmit = $state(false)
  let hasUnsavedChanges = $state(false)
  
  let session = $state<SessionState>({ mode: 'idle', current: null })
  
  $effect(() => {
    const unsubscribe = sessionStore.subscribe(state => {
      session = state
      if (state.mode === 'editing' && state.current?.sentence) {
        inputValue = state.current.sentence
        hasUnsavedChanges = false
      } else if (state.mode !== 'editing') {
        inputValue = ''
        showSubmit = false
        hasUnsavedChanges = false
      }
    })
    return unsubscribe
  })
  
  $effect(() => {
    if (session.mode === 'editing' && textInput) {
      setTimeout(() => {
        textInput?.focus()
      }, 0)
    }
  })
  
  function handleInput() {
    showSubmit = inputValue.trim().length > 0
    hasUnsavedChanges = true
    sessionStore.updateSentence(inputValue)
  }
  
  function handleSubmit() {
    if (inputValue.trim().length > 0) {
      sessionStore.beginParse()
      showSubmit = false
      hasUnsavedChanges = false
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
      <button
        type="button"
        onclick={handleSubmit}
        class="submit-button"
        aria-label="Submit text"
      >
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
    transition: background-color 0.2s, border-color 0.2s;
  }
  
  .submit-button:hover {
    background-color: #31363f;
  }
  
  .submit-button:focus-visible {
    outline: 2px solid #76abae;
    outline-offset: 2px;
  }
</style>

