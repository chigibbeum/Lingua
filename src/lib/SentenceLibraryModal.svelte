<script lang="ts">
  import { tick } from 'svelte'
  import { SvelteSet, SvelteDate } from 'svelte/reactivity'

  import Calendar from '@icons/Calendar.svelte'
  import Filter from '@icons/Filter.svelte'
  import Sort from '@icons/Sort.svelte'
  import EditText from '@icons/EditText.svelte'
  import AddNote from '@icons/AddNote.svelte'
  import DeleteGarbageIcon from '@icons/DeleteGarbageIcon.svelte'
  import SelectIcon from '@icons/SelectIcon.svelte'
  import CheckAllIcon from '@icons/CheckAllIcon.svelte'
  import SquareIcon from '@icons/SquareIcon.svelte'

  import {
    listSentences,
    listSentenceNotes,
    saveSentenceNotes,
    updateSentence,
    deleteSentence,
    type SentenceDoc,
    type SentenceNote,
  } from './services/sentenceService'
  import { posChipFormat } from './stores/settings'


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

  // Editing sentence text
  let isEditing = $state(false)
  let editText = $state('')
  let isSavingEdit = $state(false)
  let editError: string | null = $state(null)
  let isDeleting = $state(false)
  let deleteError: string | null = $state(null)

  // Sort
  let sortOrder: 'newest' | 'oldest' = $state('newest')
  function toggleSort() {
    sortOrder = sortOrder === 'newest' ? 'oldest' : 'newest'
  }

  // Filter (date range via popover)
  let showFilter = $state(false)
  let filter = $state<{ from?: string; to?: string }>({
})
  function clearFilter() {
    filter = {
}
  }
  let fromDateInput: HTMLInputElement | null = $state(null)
  async function openFilter(focusDates: boolean) {
    showFilter = !showFilter || focusDates
    if (showFilter && focusDates) {
      await tick()
      fromDateInput?.focus()
    }
  }

  // Selection / bulk delete
let selectionMode = $state(false)
let selectedIds = new SvelteSet<string>()
  function toggleSelectionMode() {
    selectionMode = !selectionMode
    if (!selectionMode) selectedIds = new SvelteSet()
  }
  function isSelected(id: string) {
    return selectedIds.has(id)
  }
  function toggleSelect(id: string) {
    const next = new SvelteSet(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    selectedIds = next
  }

  // Apply filter + sort for display
  let visibleSentences = $state<SentenceDoc[]>([])
  let allVisibleSelected = $state(false)
  $effect(() => {
    let arr = [...sentences]
    if (filter.from) {
      const from = new SvelteDate(filter.from)
      arr = arr.filter(s => s.createdAt && new SvelteDate(s.createdAt) >= from)
    }
    if (filter.to) {
      const to = new SvelteDate(filter.to)
      to.setDate(to.getDate() + 1) // inclusive end
      arr = arr.filter(s => s.createdAt && new SvelteDate(s.createdAt) < to)
    }
    arr.sort((a, b) => {
      const aT = a.createdAt ? new SvelteDate(a.createdAt).getTime() : 0
      const bT = b.createdAt ? new SvelteDate(b.createdAt).getTime() : 0
      return sortOrder === 'newest' ? bT - aT : aT - bT
    })
    // Compute selection state from the local array to avoid reading the state we are writing,
    // which would create a self-dependency loop in this effect.
    allVisibleSelected = arr.length > 0 && arr.every(s => selectedIds.has(s.id))
    visibleSentences = arr
  })
  function selectAllVisible() {
    if (allVisibleSelected) {
      selectedIds = new SvelteSet(
        [...selectedIds].filter(id => !visibleSentences.some(s => s.id === id))
      )
    } else {
      const next = new SvelteSet(selectedIds)
      visibleSentences.forEach(s => next.add(s.id))
      selectedIds = next
    }
  }

  async function deleteSelectedMany() {
    if (selectedIds.size === 0) return
    if (!window.confirm(`Delete ${selectedIds.size} selected sentence(s) and their notes?`)) return
    isDeleting = true
    deleteError = null
    try {
      const ids = Array.from(selectedIds)
      for (const id of ids) {
        await deleteSentence(id)
      }
      sentences = sentences.filter(s => !selectedIds.has(s.id))
      selected = sentences[0] ?? null
      await loadNotesForSelected()
      selectedIds = new SvelteSet()
      selectionMode = false
    } catch (caught: unknown) {
      console.error('Failed to delete selected sentences', caught)
      deleteError = 'Failed to delete selected sentences'
    } finally {
      isDeleting = false
    }
  }

  function startEdit() {
    if (!selected) return
    isEditing = true
    editText = selected.text
  }
  function cancelEdit() {
    isEditing = false
    editError = null
  }
  async function saveEdit() {
    if (!selected) return
    isSavingEdit = true
    editError = null
    try {
      await updateSentence(selected.id, {
 text: editText 
})
      const updated = {
 ...selected, text: editText.trim() 
}
      selected = updated
      sentences = sentences.map(s => (s.id === updated.id ? updated : s))
      isEditing = false
    } catch (caught: unknown) {
      console.error('Failed to update sentence', caught)
      editError = 'Failed to update sentence'
    } finally {
      isSavingEdit = false
    }
  }

  async function deleteSelected() {
    if (!selected) return
    const confirmed = window.confirm('Delete this sentence and all of its notes?')
    if (!confirmed) return
    isDeleting = true
    deleteError = null
    const currentId = selected.id
    const currentIndex = sentences.findIndex(s => s.id === currentId)
    try {
      await deleteSentence(currentId)
      const remaining = sentences.filter(s => s.id !== currentId)
      sentences = remaining
      isEditing = false
      if (remaining.length > 0) {
        const nextIndex = Math.min(Math.max(0, currentIndex), remaining.length - 1)
        selected = remaining[nextIndex]!
        await loadNotesForSelected()
      } else {
        selected = null
        notes = []
      }
    } catch (caught: unknown) {
      console.error('Failed to delete sentence', caught)
      deleteError = 'Failed to delete sentence'
    } finally {
      isDeleting = false
    }
  }

  // Adding a note
  let isAddingNote = $state(false)
  let noteType: 'vocab' | 'grammar' = $state('vocab')
  let noteTarget = $state('')
  let noteNative = $state('')
  let noteText = $state('')
  let notePos = $state('')
  let isSavingNote = $state(false)
  let noteError: string | null = $state(null)

  const posShort: Record<string, string> = {
    noun: 'N',
    verb: 'V',
    adjective: 'Adj',
    adverb: 'Adv',
    preposition: 'Prep',
    pronoun: 'Pron',
    conjunction: 'Conj',
    particle: 'Part',
    auxiliary: 'Aux',
    classifier: 'CL',
    proper_noun: 'PropN',
    numeral: 'Num',
    expression: 'Expr',
    other: 'Other',
  }

  function resetNoteForm() {
    noteType = 'vocab'
    noteTarget = ''
    noteNative = ''
    noteText = ''
    notePos = ''
  }
  function cancelAddNote() {
    isAddingNote = false
    noteError = null
    resetNoteForm()
  }
  async function saveNote() {
    if (!selected) return
    isSavingNote = true
    noteError = null
    try {
      if (noteType === 'vocab') {
        const target = noteTarget.trim()
        const native = noteNative.trim()
        if (!target || !native) {
          noteError = 'Both “Target” and “Native” are required'
          return
        }
        await saveSentenceNotes(selected.id, [
          {
 type: 'vocab', target, native, ...(notePos ? {
 pos: notePos 
} : {
}) 
},
        ])
      } else {
        const text = noteText.trim()
        if (!text) {
          noteError = 'Note text is required'
          return
        }
        await saveSentenceNotes(selected.id, [{
 type: 'grammar', text 
}])
      }
      await loadNotesForSelected()
      isAddingNote = false
      resetNoteForm()
    } catch (caught: unknown) {
      console.error('Failed to save note', caught)
      noteError = 'Failed to save note'
    } finally {
      isSavingNote = false
    }
  }

  function formatDate(value: string | null | undefined): string {
    if (!value) return ''
    const d = new SvelteDate(value)
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
    } catch (caught: unknown) {
      console.error('Failed to load sentences', caught)
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
    } catch (caught: unknown) {
      console.error('Failed to load notes', caught)
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
    onkeydown={e => {
      if (e.key === 'Escape') onClose()
    }}
  >
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-label="Sentence Library"
      tabindex="-1"
      onclick={e => e.stopPropagation()}
      onkeydown={e => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <div class="modal-header">
        <h2 class="modal-title">Saved Sentences</h2>
        <button class="close-button" type="button" aria-label="Close" onclick={() => onClose()}
          >✕</button
        >
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
                <button
                  class="icon-btn"
                  type="button"
                  aria-label={`Sort (${sortOrder})`}
                  onclick={toggleSort}
                >
                  <Sort size={18} stroke="#eeeeee" strokeWidth={1.5} />
                </button>

                <div style="position: relative;">
                  <button
                    class="icon-btn"
                    type="button"
                    aria-label="Filter"
                    onclick={() => openFilter(false)}
                  >
                    <Filter size={18} stroke="#eeeeee" strokeWidth={1.5} />
                  </button>

                  {#if showFilter}
                    <div class="filter-popover" role="dialog" aria-label="Filter sentences">
                      <label
                        >From <input
                          id="filter-from"
                          name="filter-from"
                          type="date"
                          bind:value={filter.from}
                          bind:this={fromDateInput}
                        /></label
                      >
                      <label
                        >To <input
                          id="filter-to"
                          name="filter-to"
                          type="date"
                          bind:value={filter.to}
                        /></label
                      >
                      <div
                        style="display:flex; gap:.5rem; justify-content:flex-end; margin-top:.5rem;"
                      >
                        <button class="primary" type="button" onclick={() => (showFilter = false)}
                          >Apply</button
                        >
                        <button class="icon-btn" type="button" onclick={clearFilter}>Clear</button>
                      </div>
                    </div>
                  {/if}
                </div>

                <button
                  class="icon-btn"
                  type="button"
                  aria-label="Date filter"
                  onclick={() => openFilter(true)}
                >
                  <Calendar size={18} stroke="#eeeeee" strokeWidth={1.5} />
                </button>

                <button
                  class="icon-btn"
                  type="button"
                  aria-label={selectionMode ? 'Exit select mode' : 'Select items'}
                  onclick={toggleSelectionMode}
                >
                  <SelectIcon size={18} stroke="#eeeeee" strokeWidth={1.5} ariaLabel="Select" />
                </button>

                {#if selectionMode}
                  <button
                    class="icon-btn"
                    type="button"
                    aria-label={allVisibleSelected ? 'Clear selection' : 'Select all'}
                    onclick={selectAllVisible}
                  >
                    <CheckAllIcon
                      size={18}
                      stroke="#eeeeee"
                      strokeWidth={1.5}
                      ariaLabel={allVisibleSelected ? 'Clear selection' : 'Select all'}
                    />
                  </button>
                  <button
                    class="icon-btn"
                    type="button"
                    aria-label="Delete selected"
                    disabled={selectedIds.size === 0 || isDeleting}
                    onclick={deleteSelectedMany}
                  >
                    <DeleteGarbageIcon size={18} stroke="#eeeeee" strokeWidth={1.5} />
                  </button>
                {/if}
              </div>
            </header>

            <ul role="listbox" class="sentence-list">
              {#each visibleSentences as s (s.id)}
                <li
                  role="option"
                  class="sentence-item"
                  class:selected={selected?.id === s.id}
                  class:with-check={selectionMode}
                  aria-selected={selected?.id === s.id}
                  onclick={async () => {
                    selected = s
                    await loadNotesForSelected()
                  }}
                  onkeydown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      selected = s
                      loadNotesForSelected()
                    }
                  }}
                  tabindex="0"
                >
                  {#if selectionMode}
                    <button
                      class="sentence-check-btn"
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected(s.id)}
                      aria-label={isSelected(s.id) ? 'Deselect sentence' : 'Select sentence'}
                      onclick={e => {
                        e.stopPropagation()
                        toggleSelect(s.id)
                      }}
                      onkeydown={e => e.stopPropagation()}
                    >
                      {#if isSelected(s.id)}
                        <SelectIcon
                          size={18}
                          stroke="#eeeeee"
                          strokeWidth={1.5}
                          ariaLabel="Selected"
                        />
                      {:else}
                        <SquareIcon
                          size={18}
                          stroke="#eeeeee"
                          strokeWidth={1.5}
                          ariaLabel="Not selected"
                        />
                      {/if}
                    </button>
                  {/if}
                  <div class="sentence-text">{s.text}</div>
                  {#if s.createdAt}
                    <div class="sentence-meta">
                      {new SvelteDate(s.createdAt).toLocaleString()}
                    </div>
                  {/if}
                </li>
              {/each}
            </ul>
          </aside>

          <section class="right-pane">
            {#if selected}
              <div class="selected-wrapper">
                {#if isEditing}
                  <div class="edit-row">
                    <input
                      id="edit-sentence"
                      name="edit-sentence"
                      class="edit-input"
                      bind:value={editText}
                      aria-label="Edit sentence"
                    />
                    <button class="primary" type="button" disabled={isSavingEdit} onclick={saveEdit}
                      >Save</button
                    >
                    <button class="icon-btn" type="button" onclick={cancelEdit}>Cancel</button>
                  </div>
                  {#if editError}<div class="state error">{editError}</div>{/if}
                {:else}
                  <div class="selected-header">
                    <h4 class="selected-title" aria-live="polite">{selected.text}</h4>
                    <div class="selected-actions">
                      <button
                        class="icon-btn"
                        type="button"
                        aria-label="Edit sentence"
                        onclick={startEdit}
                      >
                        <EditText size={18} stroke="#eeeeee" strokeWidth={1.5} />
                      </button>
                      <button
                        class="icon-btn"
                        type="button"
                        aria-label="Add note"
                        onclick={() => {
                          isAddingNote = true
                        }}
                      >
                        <AddNote size={18} stroke="#eeeeee" strokeWidth={1.5} />
                      </button>
                      <button
                        class="icon-btn"
                        type="button"
                        aria-label="Delete sentence"
                        onclick={deleteSelected}
                        disabled={isDeleting}
                      >
                        <DeleteGarbageIcon size={18} stroke="#eeeeee" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                {/if}
                {#if selected.createdAt}
                  <div class="selected-meta">
                    <Calendar size={14} stroke="#eeeeee" strokeWidth={1.5} />
                    <span>{formatDate(selected.createdAt)}</span>
                  </div>
                {/if}
                {#if deleteError}<div class="state error">{deleteError}</div>{/if}

                {#if isAddingNote}
                  <div class="add-note-form">
                    <div class="note-type-tabs" role="tablist" aria-label="Note type">
                      <label
                        ><input
                          type="radio"
                          name="noteType"
                          value="vocab"
                          checked={noteType === 'vocab'}
                          onclick={() => (noteType = 'vocab')}
                        /> Vocab</label
                      >
                      <label
                        ><input
                          type="radio"
                          name="noteType"
                          value="grammar"
                          checked={noteType === 'grammar'}
                          onclick={() => (noteType = 'grammar')}
                        /> Grammar</label
                      >
                    </div>

                    {#if noteType === 'vocab'}
                      <input
                        id="note-target"
                        name="note-target"
                        placeholder="Target"
                        bind:value={noteTarget}
                        aria-label="Target word or phrase"
                        onkeydown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            saveNote()
                          }
                        }}
                      />
                      <input
                        id="note-native"
                        name="note-native"
                        placeholder="Native"
                        bind:value={noteNative}
                        aria-label="Native translation"
                        onkeydown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            saveNote()
                          }
                        }}
                      />
                      <label for="note-pos" style="opacity:0.9;">Part of speech (optional)</label>
                      <select id="note-pos" name="note-pos" bind:value={notePos}>
                        <option value="">-- none --</option>
                        <option value="noun">Noun</option>
                        <option value="verb">Verb</option>
                        <option value="adjective">Adjective</option>
                        <option value="adverb">Adverb</option>
                        <option value="preposition">Preposition</option>
                        <option value="pronoun">Pronoun</option>
                        <option value="conjunction">Conjunction</option>
                        <option value="particle">Particle</option>
                        <option value="auxiliary">Auxiliary</option>
                        <option value="proper_noun">Proper noun</option>
                        <option value="numeral">Numeral</option>
                        <option value="expression">Expression</option>
                        <option value="other">Other</option>
                      </select>
                    {:else}
                      <textarea
                        id="note-text"
                        name="note-text"
                        placeholder="Grammar note"
                        bind:value={noteText}
                        aria-label="Grammar note text"
                      ></textarea>
                    {/if}

                    {#if noteError}<div class="state error">{noteError}</div>{/if}
                    <div class="note-actions">
                      <button
                        class="primary"
                        type="button"
                        disabled={isSavingNote}
                        onclick={saveNote}>Save note</button
                      >
                      <button class="icon-btn" type="button" onclick={cancelAddNote}>Cancel</button>
                    </div>
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
                      {#each notes as n (n.id)}
                        <li class="note-item">
                          <div class="note-top">
                            <div class="note-type-group">
                              <span class="note-type">{n.type}</span>
                              {#if n.type === 'vocab' && n.pos && $posChipFormat !== 'hidden'}
                                <span
                                  class="pos-chip pos-small"
                                  data-pos={n.pos}
                                  title={`Part of speech: ${n.pos}`}
                                  >{$posChipFormat === 'short'
                                    ? (posShort[n.pos] ?? n.pos)
                                    : n.pos}</span
                                >
                              {/if}
                            </div>
                            {#if n.createdAt}
                              <span class="note-date">{formatDate(n.createdAt)}</span>
                            {/if}
                          </div>
                          <div class="note-text">
                            {#if n.type === 'vocab' && n.target && n.native}
                              {n.target} → {n.native}
                            {:else if n.type === 'grammar' && n.morphemeText}
                              {n.morphemeText}: {n.text}
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
    position: relative;
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
  .sentence-item.with-check {
    padding-right: 2rem;
  }
  .sentence-check-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 20px;
    height: 20px;
    background: transparent;
    border: none;
    color: #eeeeee;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }
  .sentence-check-btn:hover {
    box-shadow: 0 0 0 3px rgba(118, 171, 174, 0.15);
  }
  .sentence-check-btn:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px #76abae66;
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

  .selected-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .selected-actions {
    display: flex;
    gap: 0.4rem;
  }

  .edit-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .edit-input {
    flex: 1;
    padding: 0.35rem 0.5rem;
    border-radius: 6px;
    border: 1px solid rgba(238, 238, 238, 0.15);
    background: #22262d;
    color: #eeeeee;
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

  .add-note-form {
    margin-top: 0.5rem;
    padding: 0.5rem;
    border: 1px dashed rgba(238, 238, 238, 0.15);
    border-radius: 8px;
    display: grid;
    gap: 0.5rem;
  }
  .note-type-tabs {
    display: flex;
    gap: 1rem;
  }
  .add-note-form input,
  .add-note-form textarea,
  .add-note-form select {
    width: 100%;
    padding: 0.35rem 0.5rem;
    border-radius: 6px;
    border: 1px solid rgba(238, 238, 238, 0.15);
    background: #22262d;
    color: #eeeeee;
  }
  .note-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
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
  .note-type-group {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  .note-text {
    font-size: 0.95rem;
    line-height: 1.35;
    color: #76abae;
  }

  .pos-chip {
    display: inline-block;
    font-size: 0.75rem;
    line-height: 1;
    padding: 0.15rem 0.35rem;
    margin-right: 0.4rem;
    border-radius: 6px;
    border: 1px solid rgba(238, 238, 238, 0.2);
    color: #eeeeee;
    opacity: 0.95;
  }
  .pos-small {
    font-size: 0.7rem;
    padding: 0.1rem 0.3rem;
    margin-left: 0.35rem;
  }
  .pos-chip[data-pos='noun'] {
    color: var(--pos-noun, #22c55e);
    border-color: currentColor;
  }
  .pos-chip[data-pos='verb'] {
    color: var(--pos-verb, #3b82f6);
    border-color: currentColor;
  }
  .pos-chip[data-pos='adjective'] {
    color: var(--pos-adjective, #f59e0b);
    border-color: currentColor;
  }
  .pos-chip[data-pos='adverb'] {
    color: var(--pos-adverb, #a855f7);
    border-color: currentColor;
  }
  .pos-chip[data-pos='preposition'] {
    color: var(--pos-preposition, #14b8a6);
    border-color: currentColor;
  }
  .pos-chip[data-pos='pronoun'] {
    color: var(--pos-pronoun, #eab308);
    border-color: currentColor;
  }
  .pos-chip[data-pos='conjunction'] {
    color: var(--pos-conjunction, #ef4444);
    border-color: currentColor;
  }
  .pos-chip[data-pos='particle'] {
    color: var(--pos-particle, #10b981);
    border-color: currentColor;
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

  .filter-popover {
    position: absolute;
    right: 0;
    top: 30px;
    background: #2b3038;
    border: 1px solid rgba(238, 238, 238, 0.08);
    border-radius: 8px;
    padding: 0.5rem;
    z-index: 2;
    display: grid;
    gap: 0.5rem;
    min-width: 220px;
  }
  .filter-popover label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    font-size: 0.9rem;
  }
  .filter-popover input[type='date'] {
    background: #22262d;
    border: 1px solid rgba(238, 238, 238, 0.15);
    color: #eeeeee;
    border-radius: 6px;
    padding: 0.25rem 0.4rem;
  }
</style>
