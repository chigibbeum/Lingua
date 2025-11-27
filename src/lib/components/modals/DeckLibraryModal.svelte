<script lang="ts">
  import { listFlashcards, type Flashcard } from '$lib/services/flashcardService'
  let {
    open,
    onClose = () => {},
  }: {
    open: boolean
    onClose?: () => void
  } = $props()

  // Deck list state
  type DeckListItem = {
    id: string
    label: string
    createdAt?: number
    kind?: 'scope' | 'tag'
  }

  let decks: DeckListItem[] = $state([])
  let selectedDeck: DeckListItem | null = $state(null)
  let isLoading = $state(false)
  let error: string | null = $state(null)

  // Selected deck detail state (e.g., cards/notes)
  let detail: Array<{ id: string; type: string; text: string; createdAt?: number }> = $state([])
  let isLoadingDetail = $state(false)
  let detailError: string | null = $state(null)

  // Flashcards loaded from the database
  let cards: Flashcard[] = $state([])

  async function loadData() {
    isLoading = true
    error = null
    try {
      cards = await listFlashcards()
      // Build pseudo-decks for global scopes (all/vocab/grammar)
      const vocabCount = cards.filter(c => c.type === 'vocab').length
      const grammarCount = cards.filter(c => c.type === 'grammar').length
      const nextDecks: DeckListItem[] = []
      nextDecks.push({
        id: 'all',
        label: `All Cards (${cards.length})`,
        kind: 'scope',
      })
      if (vocabCount > 0)
        nextDecks.push({
          id: 'vocab',
          label: `Vocab (${vocabCount})`,
          kind: 'scope',
        })
      if (grammarCount > 0)
        nextDecks.push({
          id: 'grammar',
          label: `Grammar (${grammarCount})`,
          kind: 'scope',
        })

      // Derive tag-based "decks" from flashcard tags (Option A)
      const tagCounts = new Map<string, number>()
      for (const c of cards) {
        if (!Array.isArray(c.tags)) continue
        for (const raw of c.tags) {
          const tag = String(raw ?? '').trim()
          if (!tag) continue
          tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
        }
      }
      const tagEntries = Array.from(tagCounts.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([tag, count]) => ({
          id: `tag:${tag}`,
          label: `${tag} (${count})`,
          kind: 'tag' as const,
        }))

      nextDecks.push(...tagEntries)
      decks = nextDecks
      if (!selectedDeck && nextDecks.length > 0) {
        const firstDeck = nextDecks[0]
        if (firstDeck) {
          selectedDeck = firstDeck
        }
      }
      await buildDetailForSelection()
    } catch (caught: unknown) {
      error =
        caught instanceof Error ? caught.message : 'Failed to load decks'
      decks = []
      detail = []
    } finally {
      isLoading = false
    }
  }

  async function buildDetailForSelection() {
    isLoadingDetail = true
    detailError = null
    try {
      const filterId = selectedDeck?.id ?? 'all'
      let filtered: Flashcard[]
      if (filterId === 'vocab') {
        filtered = cards.filter(c => c.type === 'vocab')
      } else if (filterId === 'grammar') {
        filtered = cards.filter(c => c.type === 'grammar')
      } else if (filterId.startsWith('tag:')) {
        const tagName = filterId.slice(4)
        filtered = cards.filter(c => {
          if (!Array.isArray(c.tags)) return false
          return c.tags.some((tag: unknown) => String(tag ?? '').trim() === tagName)
        })
      } else {
        filtered = cards
      }
      const mapped = filtered.map(c => {
        const createdAtMs = c.createdAt ? Date.parse(c.createdAt) : null
        return {
          id: c.id,
          type: c.type,
          text: `${c.front} — ${c.back}`,
          ...(createdAtMs ? {
 createdAt: createdAtMs 
} : {
}),
        }
      })
      // Newest first by createdAt if available
      mapped.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
      detail = mapped
    } catch (caught: unknown) {
      detailError =
        caught instanceof Error ? caught.message : 'Failed to load deck details'
      detail = []
    } finally {
      isLoadingDetail = false
    }
  }

  function selectDeck(deck: DeckListItem) {
    selectedDeck = deck
    // Rebuild details for selection
    buildDetailForSelection()
  }

  // Load data when modal opens
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
    aria-label="Deck Library backdrop"
    onclick={() => onClose()}
    onkeydown={e => {
      if (e.key === 'Escape') onClose()
    }}
  >
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-label="Deck Library"
      tabindex="-1"
      onclick={event => event.stopPropagation()}
      onkeydown={e => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <div class="modal-header">
        <h2 class="modal-title">Deck Library</h2>
        <button class="close-button" type="button" aria-label="Close" onclick={() => onClose()}
          >✕</button
        >
      </div>

      {#if isLoading}
        <div class="state">Loading…</div>
      {:else if error}
        <div class="state error">{error}</div>
      {:else if decks.length === 0}
        <div class="state">No decks yet.</div>
      {:else}
        <div class="modal-grid" role="group" aria-label="Split view">
          <aside class="left-pane">
            <header class="left-header">
              <h3 class="left-title">Decks</h3>
              <div class="icon-row" aria-label="Tools">
                <button class="icon-btn" aria-label="Sort">…</button>
                <button class="icon-btn" aria-label="Filter">…</button>
                <button class="icon-btn" aria-label="Date">…</button>
              </div>
            </header>

            <ul role="listbox" class="sentence-list">
              {#each decks as it (it.id)}
                <li
                  role="option"
                  class="sentence-item"
                  class:selected={selectedDeck?.id === it.id}
                  aria-selected={selectedDeck?.id === it.id}
                  tabindex="0"
                  onclick={() => selectDeck(it)}
                  onkeydown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      selectDeck(it)
                    }
                  }}
                >
                  <div class="sentence-text">{it.label}</div>
                  {#if it.createdAt}
                    <div class="sentence-meta">{new Date(it.createdAt).toLocaleString()}</div>
                  {/if}
                </li>
              {/each}
            </ul>
          </aside>

          <section class="right-pane">
            {#if selectedDeck}
              <div class="selected-wrapper">
                <h4 class="selected-title" aria-live="polite">{selectedDeck.label}</h4>
                {#if selectedDeck.createdAt}
                  <div class="selected-meta">
                    <span>{new Date(selectedDeck.createdAt).toLocaleString()}</span>
                  </div>
                {/if}

                <div class="notes-panel">
                  <div class="notes-header">Deck Details</div>
                  {#if isLoadingDetail}
                    <div class="state">Loading…</div>
                  {:else if detailError}
                    <div class="state error">{detailError}</div>
                  {:else if !detail || detail.length === 0}
                    <div class="empty-notes">No details.</div>
                  {:else}
                    <ul class="notes-list">
                      {#each detail as d (d.id)}
                        <li class="note-item">
                          <div class="note-top">
                            <span class="note-type">{d.type}</span>
                            {#if d.createdAt}
                              <span class="note-date">{new Date(d.createdAt).toLocaleString()}</span
                              >
                            {/if}
                          </div>
                          <div class="note-text">{d.text}</div>
                        </li>
                      {/each}
                    </ul>
                  {/if}
                </div>
              </div>
            {:else}
              <div class="empty-state">Select a deck to view details</div>
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
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
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
  .close-button,
  .icon-btn,
  .primary {
    background: transparent;
    color: #eeeeee;
    border-radius: 6px;
    cursor: pointer;
  }
  .close-button {
    border: none;
    padding: 0.25rem 0.5rem;
  }

  .state {
    padding: 1rem;
    text-align: center;
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

  .left-pane,
  .right-pane {
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
  .icon-row {
    display: flex;
    gap: 0.25rem;
  }
  .icon-btn {
    border: none;
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
    border: 1px solid #76abae;
    padding: 0.4rem 0.8rem;
  }
  .primary:hover {
    background: rgba(118, 171, 174, 0.15);
  }
</style>
