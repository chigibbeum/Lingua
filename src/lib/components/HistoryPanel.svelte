<script lang="ts">
  import HistoryView from '$lib/icons/HistoryView.svelte'
  import CloseIcon from '$lib/icons/XIcon.svelte'
  import FilterIcon from '$lib/icons/Filter.svelte'

  import { historyStore, type HistoryEntry } from '../stores/history'

  let {
    open,
    onClose = () => {},
  }: {
    open: boolean
    onClose?: () => void
  } = $props()

  type ScopeTab = 'all' | 'parse' | 'flashcard'
  let activeTab: ScopeTab = $state('all')

  let query = $state('')

  let entries: HistoryEntry[] = $state([])
  $effect(() => {
    const unsub = historyStore.entries.subscribe(v => (entries = v))
    return unsub
  })

  function formatTime(iso: string): string {
    try {
      const d = new Date(iso)
      return d.toLocaleTimeString([], {
 hour: '2-digit', minute: '2-digit' 
})
    } catch {
      return iso
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!open) return
    if (e.key === 'Escape') {
      onClose()
    }
  }

  $effect(() => {
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  })

  function filteredEntries(): HistoryEntry[] {
    const tabFiltered = activeTab === 'all' ? entries : entries.filter(e => e.scope === activeTab)
    const q = query.trim().toLowerCase()
    if (!q) return tabFiltered
    return tabFiltered.filter(e => {
      return (
        e.title.toLowerCase().includes(q) ||
        (e.description?.toLowerCase().includes(q) ?? false) ||
        (e.snippet?.toLowerCase().includes(q) ?? false)
      )
    })
  }
</script>

{#if open}
  <div class="history-backdrop" role="presentation" tabindex="-1" onclick={() => onClose()}></div>
{/if}

<aside class="history-panel" class:open aria-label="Recent History">
  <header class="panel-header">
    <div class="title">
      <HistoryView size={20} stroke="#eeeeee" strokeWidth={1.5} />
      <span>History</span>
    </div>
    <button class="icon-btn" type="button" aria-label="Close history" onclick={() => onClose()}>
      <CloseIcon size={18} stroke="#eeeeee" strokeWidth={1.8} />
    </button>
  </header>

  <div class="toolbar">
    <div class="tabs" role="tablist" aria-label="History filters">
      <button
        role="tab"
        class="tab"
        class:active={activeTab === 'all'}
        aria-selected={activeTab === 'all'}
        onclick={() => (activeTab = 'all')}
      >
        All
      </button>
      <button
        role="tab"
        class="tab"
        class:active={activeTab === 'parse'}
        aria-selected={activeTab === 'parse'}
        onclick={() => (activeTab = 'parse')}
      >
        Parse
      </button>
      <button
        role="tab"
        class="tab"
        class:active={activeTab === 'flashcard'}
        aria-selected={activeTab === 'flashcard'}
        onclick={() => (activeTab = 'flashcard')}
      >
        Flashcards
      </button>
    </div>
    <div class="search">
      <FilterIcon size={16} stroke="#eeeeee" strokeWidth={1.5} />
      <input
        type="search"
        placeholder="Search history"
        bind:value={query}
        aria-label="Search history"
      />
    </div>
  </div>

  <div class="list" role="list">
    {#if filteredEntries().length === 0}
      <div class="empty">No history yet.</div>
    {:else}
      {#each filteredEntries() as item (item.id)}
        <div class="entry" role="listitem">
          <div class="meta">
            <span class="scope" data-scope={item.scope}>
              {item.scope === 'parse' ? 'Parse' : 'Flashcards'}
            </span>
            <span class="time">{formatTime(item.timestamp)}</span>
          </div>
          <div class="title">{item.title}</div>
          {#if item.snippet}
            <div class="snippet">{item.snippet}</div>
          {/if}
          {#if item.description}
            <div class="desc">{item.description}</div>
          {/if}
          <div class="actions">
            <button
              class="link"
              type="button"
              onclick={() => historyStore.togglePin(item.id)}
              aria-pressed={item.pinned === true}
            >
              {item.pinned ? 'Unpin' : 'Pin'}
            </button>
            <button class="link danger" type="button" onclick={() => historyStore.remove(item.id)}>
              Remove
            </button>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <footer class="panel-footer">
    <button class="secondary" type="button" onclick={() => historyStore.clearSession()}>
      Clear session history
    </button>
  </footer>
</aside>

<style>
  .history-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 1099;
  }
  .history-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(420px, 92vw);
    transform: translateX(100%);
    transition: transform 200ms ease-in-out;
    background: #31363f;
    color: #eeeeee;
    box-shadow: -12px 0 30px rgba(0, 0, 0, 0.35);
    z-index: 1100;
    display: flex;
    flex-direction: column;
  }
  .history-panel.open {
    transform: translateX(0);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 0.9rem;
    border-bottom: 1px solid rgba(238, 238, 238, 0.08);
  }
  .title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
  }
  .icon-btn {
    background: transparent;
    border: none;
    color: #eeeeee;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 6px;
  }
  .icon-btn:hover,
  .icon-btn:focus-visible {
    background: rgba(118, 171, 174, 0.2);
    outline: none;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
  }
  .tabs {
    display: flex;
    gap: 0.4rem;
  }
  .tab {
    background: transparent;
    border: 1px solid #415780;
    color: #eeeeee;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    cursor: pointer;
    font-size: 0.85rem;
  }
  .tab.active {
    border-color: #76abae;
    background: rgba(118, 171, 174, 0.12);
  }
  .search {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: #222831;
    border: 1px solid #415780;
    padding: 0.25rem 0.4rem;
    border-radius: 6px;
  }
  .search input {
    background: transparent;
    color: #eeeeee;
    border: none;
    outline: none;
    min-width: 160px;
  }

  .list {
    padding: 0.5rem 0.75rem;
    overflow: auto;
    display: grid;
    gap: 0.5rem;
  }
  .empty {
    opacity: 0.8;
    text-align: center;
    padding: 1rem 0.5rem;
  }
  .entry {
    background: #222831;
    border: 1px solid rgba(238, 238, 238, 0.08);
    border-radius: 8px;
    padding: 0.6rem 0.6rem;
  }
  .entry .meta {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    font-size: 0.75rem;
    color: #cfd8dc;
  }
  .entry .scope[data-scope='parse'] {
    color: #76abae;
  }
  .entry .scope[data-scope='flashcard'] {
    color: #b39ddb;
  }
  .entry .time {
    opacity: 0.9;
  }
  .entry .title {
    margin-top: 0.2rem;
    font-weight: 600;
  }
  .entry .snippet {
    margin-top: 0.2rem;
    color: #eeeeee;
    opacity: 0.95;
  }
  .entry .desc {
    margin-top: 0.2rem;
    color: #cfd8dc;
    font-size: 0.9rem;
  }
  .entry .actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.4rem;
  }
  .link {
    background: transparent;
    border: none;
    color: #76abae;
    cursor: pointer;
    padding: 0;
  }
  .link:hover,
  .link:focus-visible {
    text-decoration: underline;
    outline: none;
  }
  .link.danger {
    color: #ffb4b4;
  }

  .panel-footer {
    margin-top: auto;
    padding: 0.6rem 0.75rem;
    border-top: 1px solid rgba(238, 238, 238, 0.08);
    display: flex;
    justify-content: flex-end;
  }
  .secondary {
    background: transparent;
    border: 1px solid #415780;
    color: #eeeeee;
    padding: 0.4rem 0.6rem;
    border-radius: 6px;
    cursor: pointer;
  }
  .secondary:hover,
  .secondary:focus-visible {
    background: rgba(65, 87, 128, 0.15);
    outline: none;
  }
</style>
