<script lang="ts">
  let {
    isOpen = $bindable(false),
    morphemeId = $bindable(''),
    onNoteAdded = () => {},
  }: {
    isOpen?: boolean
    morphemeId?: string
    onNoteAdded?: (morphemeId: string, payload: { type: 'grammar'; text: string }) => void
  } = $props()

  let noteText = $state('')

  function submit() {
    const text = noteText.trim()
    if (!text) return
    onNoteAdded(morphemeId, { type: 'grammar', text })
    noteText = ''
    isOpen = false
  }

  function cancel() {
    noteText = ''
    isOpen = false
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') cancel()
    else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
  }
</script>

{#if isOpen}
  <div class="modal-overlay" onclick={(e) => { if (e.target === e.currentTarget) cancel() }} onkeydown={handleKeydown} role="dialog" tabindex="-1" aria-modal="true" aria-label="Add Grammar Note">
    <div class="modal-content" role="document" tabindex="-1">
      <h2 class="modal-title">Grammar note</h2>

      <div class="form-group">
        <label class="label" for="note-text">Note Text</label>
        <textarea id="note-text" bind:value={noteText} class="textarea" placeholder="Enter your grammar note here..." rows="4"></textarea>
      </div>

      <div class="modal-actions">
        <button type="button" onclick={cancel} class="button button-cancel">Cancel</button>
        <button type="button" onclick={submit} class="button button-submit" disabled={noteText.trim().length === 0}>Add note</button>
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


