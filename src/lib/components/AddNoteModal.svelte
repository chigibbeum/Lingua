<script lang="ts">
  import VocabNote from '@icons/VocabNote.svelte'
  import GrammarNote from '@icons/GrammarNote.svelte'
  let {
    isOpen = $bindable(false),
    morphemeId = $bindable(''),
    onNoteAdded = () => {},
  }: {
    isOpen?: boolean
    morphemeId?: string
    onNoteAdded?: (
      _morphemeId: string,
      _payload:
        | { type: 'vocab'; target: string; native: string }
        | { type: 'grammar'; text: string }
    ) => void
  } = $props()

  // Grammar note state
  let noteText = $state('')
  // Vocab note state
  let vocabTarget = $state('')
  let vocabNative = $state('')
  let noteType: 'vocab' | 'grammar' = $state('vocab')

  function handleSubmit() {
    if (noteType === 'vocab') {
      const t = vocabTarget.trim()
      const n = vocabNative.trim()
      if (t.length > 0 && n.length > 0) {
        onNoteAdded(morphemeId, {
 type: 'vocab', target: t, native: n 
})
        vocabTarget = ''
        vocabNative = ''
        noteType = 'vocab'
        isOpen = false
      }
    } else {
      const text = noteText.trim()
      if (text.length > 0) {
        onNoteAdded(morphemeId, {
 type: 'grammar', text 
})
        noteText = ''
        noteType = 'vocab'
        isOpen = false
      }
    }
  }

  function handleCancel() {
    noteText = ''
    vocabTarget = ''
    vocabNative = ''
    noteType = 'vocab'
    isOpen = false
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleCancel()
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
  }
</script>

{#if isOpen}
  <div
    class="modal-overlay"
    onclick={e => {
      if (e.target === e.currentTarget) handleCancel()
    }}
    onkeydown={handleKeydown}
    role="dialog"
    tabindex="-1"
    aria-modal="true"
    aria-label="Add Note"
  >
    <div class="modal-content" role="document" tabindex="-1">
      <h2 class="modal-title">Add Note</h2>

      <div class="form-group">
        <div class="label">Note Type</div>
        <div class="icon-selector" role="radiogroup" aria-label="Note Type">
          <button
            type="button"
            class="icon-option"
            class:selected={noteType === 'vocab'}
            onclick={() => (noteType = 'vocab')}
            role="radio"
            aria-checked={noteType === 'vocab'}
            aria-label="Vocabulary note"
            title="Vocabulary note"
          >
            <VocabNote size={36} stroke="#eeeeee" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            class="icon-option"
            class:selected={noteType === 'grammar'}
            onclick={() => (noteType = 'grammar')}
            role="radio"
            aria-checked={noteType === 'grammar'}
            aria-label="Grammar note"
            title="Grammar note"
          >
            <GrammarNote size={36} stroke="#eeeeee" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div class="form-group">
        {#if noteType === 'vocab'}
          <label class="label" for="vocab-target">Target (front)</label>
          <input
            id="vocab-target"
            type="text"
            bind:value={vocabTarget}
            class="input"
            placeholder="単語 (target language)"
          />

          <label class="label" for="vocab-native" style="margin-top: 0.75rem;">Native (back)</label>
          <input
            id="vocab-native"
            type="text"
            bind:value={vocabNative}
            class="input"
            placeholder="Word meaning (native language)"
          />
        {:else}
          <label class="label" for="note-text">Note Text</label>
          <textarea
            id="note-text"
            bind:value={noteText}
            class="textarea"
            placeholder="Enter your grammar note here..."
            rows="4"
          ></textarea>
        {/if}
      </div>

      <div class="modal-actions">
        <button type="button" onclick={handleCancel} class="button button-cancel"> Cancel </button>
        <button
          type="button"
          onclick={handleSubmit}
          class="button button-submit"
          disabled={noteType === 'vocab'
            ? vocabTarget.trim().length === 0 || vocabNative.trim().length === 0
            : noteText.trim().length === 0}
        >
          Add Note
        </button>
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

  .icon-selector {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    align-items: center;
  }

  .icon-option {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: #eeeeee;
    cursor: pointer;
    transition:
      background-color 0.2s,
      border-color 0.2s,
      box-shadow 0.2s;
  }

  .icon-option:hover {
    background-color: #38465d;
  }

  .icon-option.selected {
    background-color: #38465d;
  }

  .textarea {
    width: 100%;
    background-color: #222831;
    border: 1px solid #415780;
    border-radius: 0.35rem;
    padding: 0.75rem;
    color: #eeeeee;
    font-size: 1rem;
    font-family: inherit;
    resize: vertical;
    min-height: 100px;
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

  .textarea:focus {
    outline: none;
    border-color: #76abae;
  }

  .textarea::placeholder {
    color: #76abae;
    opacity: 0.6;
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
