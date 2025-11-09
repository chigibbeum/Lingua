## Split‑View Modal UI Pattern (Sentence Library)

Based on `src/lib/SentenceLibraryModal.svelte`. Use this as a reusable pattern for any “library/detail” modal where a list in the left pane drives a detail view in the right pane.

### Overview
A dialog modal with a two‑pane split view:
- Left pane: scrollable selectable list (listbox pattern)
- Right pane: details of the selected item with its own loading/empty/error states (e.g., notes)
 

### Anatomy
- Modal backdrop and container:
  - `role="dialog"`, `aria-modal="true"`
  - Fixed max height; scroll within panes, not the page
- Header: title + close button
- Split view grid:
  - Left pane: section header with tool icons; scrollable list
  - Right pane: selected item title, metadata, and nested list panel (e.g., notes)
- Footer: primary action(s), typically a Close button

### Behavior
- Two levels of loading/error:
  - Global list state (`isLoading`/`error`)
  - Scoped detail state (`isLoadingNotes`/`notesError`)
- Selecting an item loads its details
- Backdrop click closes; inner container uses `on:click|stopPropagation`

### Accessibility
- Dialog semantics: `role="dialog"`, `aria-modal="true"`, clear title
- Group split view with `role="group"` and `aria-label`
- Left list uses listbox pattern:
  - `ul[role="listbox"]` and `li[role="option"]`
  - `aria-selected` on options
  - Keyboard focus via `tabindex="0"` and visible `:focus-visible` styles
- Announce selected detail updates via `aria-live="polite"`

### Layout and Styling
- Container:
  - Width: `min(960px, 92vw)`, max-height: `80vh`
  - Dark theme: modal `#31363f`, panes `#2b3038`, cards `#22262d`, text `#eeeeee`
  - Elevation: `box-shadow: 0 10px 30px rgba(0,0,0,0.35)`
- Grid:
  - Columns: `1fr 2fr`, `gap: 1rem`, `min-height: 360px`
- Scroll strategy:
  - Modal/panes use `overflow: hidden`
  - Inner lists (`.sentence-list`, `.notes-panel`) use `overflow: auto`

### Visual Language
- Accent: `#76abae` for hover/selection outlines
- Subtle separators: `rgba(238, 238, 238, 0.08)` borders
- Radii: 6–8px; compact paddings; restrained hover states

### Reusable Svelte skeleton (markup)
```svelte
<script lang="ts">
  export let open: boolean;
  export let onClose: () => void = () => {};

  // Example state slots
  let items = [];
  let selected: any = null;
  let isLoading = false;
  let error: string | null = null;

  let detail = [];
  let isLoadingDetail = false;
  let detailError: string | null = null;

  function selectItem(item: any) {
    selected = item;
    // load detail for selected...
  }
</script>

{#if open}
  <div class="modal-backdrop" role="dialog" aria-modal="true" aria-label="Title" on:click={onClose}>
    <div class="modal" on:click|stopPropagation>
      <div class="modal-header">
        <h2 class="modal-title">Title</h2>
        <button class="close-button" type="button" aria-label="Close" on:click={onClose}>✕</button>
      </div>

      {#if isLoading}
        <div class="state">Loading…</div>
      {:else if error}
        <div class="state error">{error}</div>
      {:else if items.length === 0}
        <div class="state">No items yet.</div>
      {:else}
        <div class="modal-grid" role="group" aria-label="Split view">
          <aside class="left-pane">
            <header class="left-header">
              <h3 class="left-title">Items</h3>
              <div class="icon-row" aria-label="Tools">
                <button class="icon-btn" aria-label="Sort">…</button>
                <button class="icon-btn" aria-label="Filter">…</button>
                <button class="icon-btn" aria-label="Date">…</button>
              </div>
            </header>

            <ul role="listbox" class="sentence-list">
              {#each items as it}
                <li
                  role="option"
                  class="sentence-item"
                  class:selected={selected?.id === it.id}
                  aria-selected={selected?.id === it.id}
                  tabindex="0"
                  on:click={() => selectItem(it)}
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
            {#if selected}
              <div class="selected-wrapper">
                <h4 class="selected-title" aria-live="polite">{selected.label}</h4>
                {#if selected.createdAt}
                  <div class="selected-meta">
                    <span>{new Date(selected.createdAt).toLocaleString()}</span>
                  </div>
                {/if}

                <div class="notes-panel">
                  <div class="notes-header">Details</div>
                  {#if isLoadingDetail}
                    <div class="state">Loading…</div>
                  {:else if detailError}
                    <div class="state error">{detailError}</div>
                  {:else if !detail || detail.length === 0}
                    <div class="empty-notes">No details.</div>
                  {:else}
                    <ul class="notes-list">
                      {#each detail as d}
                        <li class="note-item">
                          <div class="note-top">
                            <span class="note-type">{d.type}</span>
                            {#if d.createdAt}
                              <span class="note-date">{new Date(d.createdAt).toLocaleString()}</span>
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
              <div class="empty-state">Select an item to view details</div>
            {/if}
          </section>
        </div>
      {/if}

      <div class="modal-footer">
        <button type="button" class="primary" on:click={onClose}>Close</button>
      </div>
    </div>
  </div>
{/if}
```

### Core CSS starter (copy/paste and tweak)

```css

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

.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
.modal-title { margin: 0; font-size: 1.1rem; }
.close-button, .icon-btn, .primary { background: transparent; color: #eeeeee; border-radius: 6px; cursor: pointer; }
.close-button { border: none; padding: 0.25rem 0.5rem; }

.state { padding: 1rem; text-align: center; opacity: 0.9; }
.state.error { color: #ffb4b4; }

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

.left-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
.icon-row { display: flex; gap: 0.25rem; }
.icon-btn { border: none; padding: 0.25rem; }

.sentence-list { list-style: none; padding: 0; margin: 0; overflow: auto; }
.sentence-item {
  border-bottom: 1px solid rgba(238, 238, 238, 0.08);
  padding: 0.6rem 0.25rem;
  cursor: pointer;
  border-radius: 6px;
}
.sentence-item:hover, .sentence-item:focus-visible { background: rgba(118, 171, 174, 0.08); outline: none; }
.sentence-item.selected { background: rgba(118, 171, 174, 0.15); box-shadow: 0 0 0 2px #76abae66 inset; }

.sentence-text { font-size: 1rem; line-height: 1.4; }
.sentence-meta { font-size: 0.8rem; opacity: 0.7; margin-top: 0.25rem; }

.selected-wrapper { display: flex; flex-direction: column; gap: 0.5rem; height: 100%; overflow: hidden; }
.selected-title { margin: 0; font-size: 1.05rem; line-height: 1.4; }
.selected-meta { display: flex; align-items: center; gap: 0.35rem; opacity: 0.8; font-size: 0.85rem; }

.notes-panel { margin-top: 0.25rem; border-top: 1px solid rgba(238, 238, 238, 0.08); padding-top: 0.5rem; overflow: auto; }
.notes-header { font-size: 0.95rem; margin-bottom: 0.5rem; }
.empty-notes { opacity: 0.8; font-size: 0.9rem; }

.notes-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.note-item { background: #22262d; border: 1px solid rgba(238, 238, 238, 0.08); border-radius: 8px; padding: 0.5rem 0.6rem; }
.note-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; font-size: 0.8rem; opacity: 0.85; }
.note-type { text-transform: capitalize; }
.note-text { font-size: 0.95rem; line-height: 1.35; }

.modal-footer { display: flex; justify-content: flex-end; padding-top: 0.75rem; border-top: 1px solid rgba(238, 238, 238, 0.08); margin-top: 0.5rem; }
.primary { border: 1px solid #76abae; padding: 0.4rem 0.8rem; }
.primary:hover { background: rgba(118, 171, 174, 0.15); }
```

### Checklist (for future components)
- Modal shell with backdrop close + inner stopPropagation
- Grid split view: `1fr 2fr`; scroll inside lists/panels
- Separate loading/error/empty for list and detail panes
- Listbox semantics: `role="listbox"`/`role="option"`, `aria-selected`, focus and hover states
- Live updates on detail header (`aria-live="polite"`)
- Consistent colors, subtle borders, 6–8px radii, restrained elevation
- Ensure keyboard navigation works end‑to‑end