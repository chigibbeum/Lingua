<script lang="ts">
  /**
   * Create Flashcards Modal
   *
   * Displays vocabulary notes for selection and flashcard creation.
   * Business logic for loading and deduplication is delegated to
   * flashcardActions service following the "smart stores, dumb components" pattern.
   */
  import CheckAllIcon from '$lib/icons/CheckAllIcon.svelte'
  import {
    loadVocabItemsForFlashcards,
    type VocabItem,
  } from '$lib/services/flashcardActions'
  import {
    createFlashcardsFromVocabNotes,
    type VocabFlashInput,
  } from '$lib/services/flashcardService'

  import type { ParseSession } from '$lib/stores/session'

  let {
    isOpen = $bindable(false),
    session = $bindable<ParseSession | null>(null),
    onClose = () => {},
    onCreated,
  }: {
    isOpen?: boolean
    session?: ParseSession | null
    onClose?: () => void
    onCreated?: (_count: number) => void
  } = $props()

  // ─────────────────────────────────────────────────────────────
  // Local UI State
  // ─────────────────────────────────────────────────────────────

  let isLoading = $state(false)
  let error: string | null = $state(null)
  let items: VocabItem[] = $state([])
  let selectedIds: string[] = $state([])

  // ─────────────────────────────────────────────────────────────
  // Data Loading (delegated to service)
  // ─────────────────────────────────────────────────────────────

  async function loadData() {
    isLoading = true
    error = null
    try {
      // Delegate loading and deduplication to service
      items = await loadVocabItemsForFlashcards(session)
      selectedIds = []
    } catch (caught: unknown) {
      console.error('Failed to load vocabulary notes', caught)
      error = 'Failed to load notes'
      items = []
      selectedIds = []
    } finally {
      isLoading = false
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Selection Handlers
  // ─────────────────────────────────────────────────────────────

  function toggleSelect(id: string) {
    if (selectedIds.includes(id)) {
      selectedIds = selectedIds.filter(x => x !== id)
    } else {
      selectedIds = [...selectedIds, id]
    }
  }

  function selectAll() {
    if (selectedIds.length === items.length) {
      selectedIds = []
    } else {
      selectedIds = items.map(i => i.id)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Submit Handler
  // ─────────────────────────────────────────────────────────────

  async function handleSubmit() {
    const chosen = items.filter(i => selectedIds.includes(i.id))
    if (chosen.length === 0) {
      onClose()
      return
    }

    const payload: VocabFlashInput[] = chosen.map(c => ({
      front: c.front,
      back: c.back,
      ...(c.sentenceText ? { sentenceText: c.sentenceText } : {}),
      ...(c.morphemeText ? { morphemeText: c.morphemeText } : {}),
      ...(c.sentenceId ? { sentenceId: c.sentenceId } : {}),
      ...(c.morphemeId ? { morphemeId: c.morphemeId } : {}),
      ...(Array.isArray(c.tags) && c.tags.length ? { tags: c.tags } : {}),
      ...(c.pos ? { pos: c.pos } : {}),
    }))

    try {
      isLoading = true
      const count = await createFlashcardsFromVocabNotes(payload)
      onCreated?.(count)
      onClose()
    } catch (caught: unknown) {
      console.error('Failed to create flashcards from notes', caught)
      error = 'Failed to create flashcards'
    } finally {
      isLoading = false
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────

  $effect(() => {
    if (isOpen) {
      loadData()
    }
  })
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
      aria-label="Create Flashcards"
      tabindex="-1"
      onclick={e => e.stopPropagation()}
      onkeydown={e => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <header class="header">
        <h2 class="title">Create Flashcards</h2>
        <button class="icon-btn" type="button" aria-label="Select all" onclick={selectAll}>
          <CheckAllIcon size={20} stroke="#eeeeee" strokeWidth={1.5} ariaLabel="Select all" />
        </button>
      </header>

      {#if isLoading}
        <div class="state">Loading…</div>
      {:else if error}
        <div class="state error">{error}</div>
      {:else if items.length === 0}
        <div class="state">No recent vocabulary notes.</div>
      {:else}
        <ul class="list" role="listbox" aria-label="Recent vocabulary notes">
          {#each items as it (it.id)}
            <li class="card" role="option" aria-selected={selectedIds.includes(it.id)}>
              <button
                class="checkbox"
                type="button"
                aria-label="Select note"
                onclick={() => toggleSelect(it.id)}
              >
                {#if selectedIds.includes(it.id)}
                  ✓
                {:else}
                  □
                {/if}
              </button>
              <div class="front">{it.front}</div>
              <div class="back">{it.back}</div>
              {#if it.pos}
                <div class="meta">
                  {it.pos.replace(/_/g, ' ').slice(0, 1).toUpperCase() + it.pos.replace(/_/g, ' ').slice(1)}
                </div>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}

      <footer class="footer">
        <button class="button" type="button" onclick={onClose}>Cancel</button>
        <button
          class="button primary"
          type="button"
          onclick={handleSubmit}
          disabled={selectedIds.length === 0 || isLoading}
          >Create {selectedIds.length > 0 ? selectedIds.length : ''}</button
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
    width: min(800px, 92vw);
    max-height: 80vh;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
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

  .icon-btn {
    background: transparent;
    border: none;
    color: #eeeeee;
    cursor: pointer;
    border-radius: 6px;
    padding: 0.25rem;
  }

  .state {
    padding: 1rem;
    text-align: center;
    opacity: 0.9;
  }
  .state.error {
    color: #ffb4b4;
  }

  .list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.75rem;
    overflow: auto;
    max-height: 50vh; /* scrollable */
  }

  .card {
    position: relative;
    background: #22262d;
    border: 1px solid rgba(238, 238, 238, 0.08);
    border-radius: 8px;
    padding: 0.6rem 0.6rem 0.8rem 0.6rem;
  }

  .checkbox {
    position: absolute;
    top: 0.4rem;
    right: 0.4rem;
    background: transparent;
    border: 1px solid #76abae;
    color: #eeeeee;
    border-radius: 4px;
    width: 22px;
    height: 22px;
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    cursor: pointer;
  }

  .front {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  .back {
    opacity: 0.9;
    margin-bottom: 0.25rem;
  }
  .meta {
    opacity: 0.7;
    font-size: 0.85rem;
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
  .button.primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
