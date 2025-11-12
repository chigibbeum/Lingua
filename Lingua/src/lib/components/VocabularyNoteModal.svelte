<script lang="ts">
  import type { PosTag } from '@lib/stores/session'
  let {
    isOpen = $bindable(false),
    morphemeId = $bindable(''),
    initialTarget = '',
    onNoteAdded = () => {},
  }: {
    isOpen?: boolean
    morphemeId?: string
    initialTarget?: string
    onNoteAdded?: (
      morphemeId: string,
      payload: { type: 'vocab'; target: string; native: string; pos?: PosTag }
    ) => void
  } = $props()

  let vocabTarget = $state('')
  let vocabNative = $state('')
  let vocabPos: PosTag | '' = $state('')
  
  let wasOpen = $state(false)
  $effect(() => {
    if (isOpen && !wasOpen) {
      vocabTarget = initialTarget ?? ''
    }
    wasOpen = isOpen
  })

  function submit() {
    const t = vocabTarget.trim()
    const n = vocabNative.trim()
    if (!t || !n) return
    onNoteAdded(morphemeId, {
      type: 'vocab',
      target: t,
      native: n,
      ...(vocabPos ? { pos: vocabPos } as const : {}),
    })
    vocabTarget = ''
    vocabNative = ''
    vocabPos = ''
    isOpen = false
  }

  function cancel() {
    vocabTarget = ''
    vocabNative = ''
    vocabPos = ''
    isOpen = false
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') cancel()
    else if (e.key === 'Enter') {
      e.preventDefault()
      submit()
    }
  }
</script>

{#if isOpen}
  <div class="modal-overlay" onclick={(e) => { if (e.target === e.currentTarget) cancel() }} onkeydown={handleKeydown} role="dialog" tabindex="-1" aria-modal="true" aria-label="Add Vocabulary Note">
    <div class="modal-content" role="document" tabindex="-1">
      <h2 class="modal-title">Vocabulary note</h2>

      <div class="form-group">
        <label class="label" for="vocab-target">Target (front)</label>
        <input id="vocab-target" type="text" bind:value={vocabTarget} class="input" placeholder="単語 (target language)" />

        <label class="label" for="vocab-native" style="margin-top: 0.75rem;">Native (back)</label>
        <input id="vocab-native" type="text" bind:value={vocabNative} class="input" placeholder="Word meaning (native language)" />

        <label class="label" for="vocab-pos" style="margin-top: 0.75rem;">Part of speech (optional)</label>
        <select id="vocab-pos" bind:value={vocabPos} class="input">
          <option value="">-- none --</option>
          <option value="noun">Noun</option>
          <option value="verb">Verb</option>
          <option value="adjective">Adjective</option>
          <option value="adverb">Adverb</option>
          <option value="particle">Particle</option>
          <option value="pronoun">Pronoun</option>
          <option value="preposition">Preposition</option>
          <option value="conjunction">Conjunction</option>
          <option value="interjection">Interjection</option>
          <option value="auxiliary">Auxiliary</option>
          <option value="classifier">Classifier</option>
          <option value="proper_noun">Proper noun</option>
          <option value="numeral">Numeral</option>
          <option value="expression">Expression</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div class="modal-actions">
        <button type="button" onclick={cancel} class="button button-cancel">Cancel</button>
        <button type="button" onclick={submit} class="button button-submit" disabled={vocabTarget.trim().length === 0 || vocabNative.trim().length === 0}>Add note</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: #31363f;
    border-radius: 0.35rem;
    padding: 2rem;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-title {
    color: #eeeeee;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .label {
    display: block;
    color: #eeeeee;
    margin-bottom: 0.5rem;
    font-size: calc(0.9rem + 3px);
    text-align: center;
  }
  
  .input {
    width: 100%;
    background-color: #222831;
    border: 1px solid #415780;
    border-radius: 0.35rem;
    padding: 0.6rem 0.75rem;
    color: #eeeeee;
    font-size: 1rem;
    font-family: inherit;
  }
  
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
  }
  
  .button {
    padding: 0.5rem 1.5rem;
    border: none;
    border-radius: 0.35rem;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .button-cancel {
    background-color: transparent;
    color: #eeeeee;
  }
  
  .button-cancel:hover {
    background-color: #415780;
  }
  
  .button-submit {
    background-color: #76abae;
    color: #222831;
  }
  
  .button-submit:hover:not(:disabled) {
    background-color: #5a8a8d;
  }
  
  .button-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>


