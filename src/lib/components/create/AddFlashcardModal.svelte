<script lang="ts">
import { createFlashcardsFromVocabNotes } from '@lib/services/flashcardService'

import FlashcardCreationForm from './FlashcardCreationForm.svelte'

let {
  isOpen = $bindable(false),
  onClose = () => {},
  onCreated,
}: {
  isOpen?: boolean
  onClose?: () => void
  onCreated?: (_count: number) => void
} = $props()

let isSubmitting = $state(false)
let error: string | null = $state(null)

type CreationPayload = {
  target: string
  native: string
  partOfSpeech: string
  tags: string[]
  decks: string[]
}

async function handleSubmit(data: CreationPayload) {
  const front = String(data.target ?? '').trim()
  const back = String(data.native ?? '').trim()
  if (!front || !back) {
    error = 'Please fill in both Target and Native.'
    return
  }
  try {
    isSubmitting = true
    error = null
    const count = await createFlashcardsFromVocabNotes([
      {
        front,
        back,
        pos: data.partOfSpeech,
        tags: Array.isArray(data.tags) ? data.tags : [],
      },
    ])
    onCreated?.(count)
    onClose()
  } catch (caught: unknown) {
    console.error('Failed to create flashcard', caught)
    error = 'Failed to create flashcard. Please try again.'
  } finally {
    isSubmitting = false
  }
}
</script>

{#if isOpen}
  <div
    class="modal-overlay"
    role="presentation"
    tabindex="-1"
    onclick={e => {
      if (e.target === e.currentTarget) onClose()
    }}
    onkeydown={e => {
      if (e.key === 'Escape') onClose()
    }}
  >
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-label="Add Flashcard"
      tabindex="-1"
      onclick={e => e.stopPropagation()}
      onkeydown={e => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <header class="header">
        <h2 class="title">Add Flashcard</h2>
        <button class="close" type="button" aria-label="Close" onclick={onClose}>✕</button>
      </header>

      {#if error}
        <div class="error" role="alert">{error}</div>
      {/if}

      <FlashcardCreationForm
        onSubmit={handleSubmit}
        onImport={() => {
          /* Placeholder for future import workflow */
        }}
      />

      <footer class="footer">
        <button class="button" type="button" onclick={onClose} disabled={isSubmitting}
          >Cancel</button
        >
        <button class="button primary" type="button" disabled
          >{isSubmitting ? 'Submitting…' : 'Ready'}</button
        >
      </footer>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
  }

  .modal {
    background: #31363f;
    color: #eeeeee;
    width: min(880px, 94vw);
    max-height: 82vh;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  .title {
    margin: 0;
    font-size: 1.1rem;
  }
  .close {
    background: transparent;
    border: none;
    color: #eeeeee;
    cursor: pointer;
    border-radius: 6px;
    padding: 0.25rem 0.5rem;
  }

  .error {
    color: #ffb4b4;
    margin-bottom: 0.5rem;
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.75rem;
    border-top: 1px solid rgba(238, 238, 238, 0.08);
    padding-top: 0.75rem;
  }
  .button {
    padding: 0.45rem 0.9rem;
    border-radius: 6px;
    border: 1px solid #415780;
    background: transparent;
    color: #eeeeee;
    cursor: pointer;
  }
  .button.primary {
    border-color: #76abae;
  }
  .button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
