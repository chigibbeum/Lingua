<script lang="ts">
  import { listSentences, type SentenceDoc, type SentenceNote, listSentenceNotes } from './services/sentenceService'
  import Calendar from '@icons/Calendar.svelte'
  import Filter from '@icons/Filter.svelte'
  import Sort from '@icons/Sort.svelte'

  let {
    open,
    onClose = () => {},
  }: {
    open: boolean
    onClose?: () => void
  } = $props()

  let sentences: SentenceDoc[] = $state([])
  let selected: SentenceDoc | null = $state(null)
  let isLoading = $state(false)
  let error: string | null = $state(null)
  let notes: SentenceNote[] = $state([])
  let isLoadingNotes = $state(false)
  let notesError: string | null = $state(null)

  function formatDate(value: string | null | undefined): string {
    if (!value) return ''
    const d = new Date(value)
    return isNaN(d.getTime()) ? '' : d.toLocaleString()
  }

  async function loadData() {
    isLoading = true
    error = null
    try {
      sentences = await listSentences()
      if (!selected && sentences.length > 0) {
        selected = sentences[0]!
        await loadNotesForSelected()
      }
    } catch (e) {
      error = 'Failed to load sentences'
    } finally {
      isLoading = false
    }
  }

  async function loadNotesForSelected() {
    if (!selected) {
      notes = []
      return
    }
    isLoadingNotes = true
    notesError = null
    try {
      notes = await listSentenceNotes(selected.id)
    } catch (e) {
      notesError = 'Failed to load notes'
      notes = []
    } finally {
      isLoadingNotes = false
    }
  }

  $effect(() => {
    if (open) {
      loadData()
    }
  })
</script>

{#if open}
  <div
    class="modal-backdrop"
    role="presentation"
    tabindex="-1"
    onclick={() => onClose()}
    onkeydown={(e) => { if (e.key === 'Escape') onClose() }}
  >
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-label="Sentence Library"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => { if (e.key === 'Escape') onClose() }}
    >
      <div class="modal-header">
        <h2 class="modal-title">Saved Sentences</h2>
        <button class="close-button" type="button" aria-label="Close" onclick={() => onClose()}>✕</button>
      </div>

      {#if isLoading}
        <div class="state">Loading…</div>
      {:else if error}
        <div class="state error">{error}</div>
      {:else if sentences.length === 0}
        <div class="state">No saved sentences yet.</div>
      {:else}
        <div class="modal-grid" role="group" aria-label="Sentence Library split view">
          <aside class="left-pane">
            <header class="left-header">
              <h3 class="left-title">Saved Sentences</h3>
              <div class="icon-row" aria-label="Library tools">
                <button class="icon-btn" type="button" aria-label="Sort">
                  <Sort size={18} stroke="#eeeeee" strokeWidth={1.5} />
                </button>
                <button class="icon-btn" type="button" aria-label="Filter">
                  <Filter size={18} stroke="#eeeeee" strokeWidth={1.5} />
                </button>
                <button class="icon-btn" type="button" aria-label="Date">
                  <Calendar size={18} stroke="#eeeeee" strokeWidth={1.5} />
                </button>
              </div>
            </header>

            <ul role="listbox" class="sentence-list">
              {#each sentences as s}
                <li
                  role="option"
                  class="sentence-item"
                  class:selected={selected?.id === s.id}
                  aria-selected={selected?.id === s.id}
                  onclick={async () => { selected = s; await loadNotesForSelected() }}
                  onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { selected = s; loadNotesForSelected() } }}
                  tabindex="0"
                >
                  <div class="sentence-text">{s.text}</div>
                  {#if s.createdAt}
                    <div class="sentence-meta">{new Date(s.createdAt).toLocaleString()}</div>
                  {/if}
                </li>
              {/each}
            </ul>
          </aside>

          <section class="right-pane">
            {#if selected}
              <div class="selected-wrapper">
                <h4 class="selected-title" aria-live="polite">{selected.text}</h4>
                {#if selected.createdAt}
                  <div class="selected-meta">
                    <Calendar size={14} stroke="#eeeeee" strokeWidth={1.5} />
                    <span>{formatDate(selected.createdAt)}</span>
                  </div>
                {/if}

                <div class="notes-panel">
                  <div class="notes-header">Notes</div>
                  {#if isLoadingNotes}
                    <div class="state">Loading notes…</div>
                  {:else if notesError}
                    <div class="state error">{notesError}</div>
                  {:else if !notes || notes.length === 0}
                    <div class="empty-notes">No notes for this sentence.</div>
                  {:else}
                    <ul class="notes-list">
                      {#each notes as n}
                        <li class="note-item">
                          <div class="note-top">
                            <span class="note-type">{n.type}</span>
                            {#if n.createdAt}
                              <span class="note-date">{formatDate(n.createdAt)}</span>
                            {/if}
                          </div>
                          <div class="note-text">
                            {#if n.type === 'vocab' && n.target && n.native}
                              {n.target} → {n.native}
                            {:else}
                              {n.text}
                            {/if}
                          </div>
                        </li>
                      {/each}
                    </ul>
                  {/if}
                </div>
              </div>
            {:else}
              <div class="empty-state">Select a sentence to view details</div>
            {/if}
          </section>
        </div>
      {/if}

      <div class="modal-footer">
        <button type="button" class="primary" onclick={() => onClose()}>Close</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
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
    width: min(960px, 92vw);
    max-height: 80vh;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 30px rgba(0,0,0,0.35);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .modal-title {
    margin: 0;
    font-size: 1.1rem;
  }

  .close-button {
    background: transparent;
    border: none;
    color: #eeeeee;
    cursor: pointer;
    border-radius: 6px;
    padding: 0.25rem 0.5rem;
  }

  .state {
    padding: 1rem;
    text-align: center;
    color: #eeeeee;
    opacity: 0.9;
  }

  .state.error {
    color: #ffb4b4;
  }

  .modal-grid {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1rem;
    min-height: 360px;
    overflow: hidden;
  }

  .left-pane, .right-pane {
    background: #2b3038;
    border-radius: 8px;
    padding: 0.75rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .left-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .left-title {
    margin: 0;
    font-size: 1rem;
  }

  .icon-row {
    display: flex;
    gap: 0.25rem;
  }

  .icon-btn {
    background: transparent;
    border: none;
    color: #eeeeee;
    cursor: pointer;
    border-radius: 6px;
    padding: 0.25rem;
  }

  .sentence-list {
    list-style: none;
    padding: 0;
    margin: 0;
    overflow: auto;
  }

  .sentence-item {
    border-bottom: 1px solid rgba(238, 238, 238, 0.08);
    padding: 0.6rem 0.25rem;
    cursor: pointer;
    border-radius: 6px;
  }

  .sentence-item:hover,
  .sentence-item:focus-visible {
    background: rgba(118, 171, 174, 0.08);
    outline: none;
  }

  .sentence-item.selected {
    background: rgba(118, 171, 174, 0.15);
    box-shadow: 0 0 0 2px #76abae66 inset;
  }

  .sentence-text {
    font-size: 1rem;
    line-height: 1.4;
  }

  .sentence-meta {
    font-size: 0.8rem;
    opacity: 0.7;
    margin-top: 0.25rem;
  }

  .right-pane {
    overflow: hidden;
  }

  .selected-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    height: 100%;
    overflow: hidden;
  }

  .selected-title {
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.4;
  }

  .selected-meta {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    opacity: 0.8;
    font-size: 0.85rem;
  }

  .notes-panel {
    margin-top: 0.25rem;
    border-top: 1px solid rgba(238, 238, 238, 0.08);
    padding-top: 0.5rem;
    overflow: auto;
  }

  .notes-header {
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
  }

  .empty-notes {
    opacity: 0.8;
    font-size: 0.9rem;
  }

  .notes-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .note-item {
    background: #22262d;
    border: 1px solid rgba(238, 238, 238, 0.08);
    border-radius: 8px;
    padding: 0.5rem 0.6rem;
  }

  .note-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
    font-size: 0.8rem;
    opacity: 0.85;
  }

  .note-type {
    text-transform: capitalize;
  }

  .note-text {
    font-size: 0.95rem;
    line-height: 1.35;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(238, 238, 238, 0.08);
    margin-top: 0.5rem;
  }

  .primary {
    background: transparent;
    border: 1px solid #76abae;
    color: #eeeeee;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
  }

  .primary:hover {
    background: rgba(118, 171, 174, 0.15);
  }
</style>


