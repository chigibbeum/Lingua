<script lang="ts">
  import { get } from 'svelte/store'

  import { sessionStore } from '@lib/stores/session'
  import InsertLeft from '@icons/InsertLeft.svelte'
  import InsertRight from '@icons/InsertRight.svelte'
  import EditNode from '@icons/EditNode.svelte'

  import type { SessionState } from '@lib/stores/session'

  let clickedMorphemeId = $state<string | null>(null)
  let editingMorphemeId = $state<string | null>(null)
  let editingValue = $state('')
  let insertingLeft = $state<string | null>(null)
  let insertingRight = $state<string | null>(null)
  let insertValue = $state('')
  let popoverPosition = $state({
 x: 0, y: 0 
})

  let session = $state<SessionState>(get(sessionStore))

  $effect(() => {
    const unsubscribe = sessionStore.subscribe(state => {
      session = state
      if (state.mode !== 'editing' || !state.current?.morphemes.length) {
        clickedMorphemeId = null
        editingMorphemeId = null
        editingValue = ''
        insertingLeft = null
        insertingRight = null
        insertValue = ''
      }
    })
    return unsubscribe
  })

  function handleMorphemeClick(e: Event, morphemeId: string) {
    e.stopPropagation()

    if (
      editingMorphemeId === morphemeId ||
      insertingLeft === morphemeId ||
      insertingRight === morphemeId
    ) {
      return
    }

    clickedMorphemeId = morphemeId
    updatePopoverPosition(e)
  }

  function handleMorphemeKeydown(e: KeyboardEvent, morphemeId: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleMorphemeClick(e, morphemeId)
    }
  }

  function updatePopoverPosition(e: Event) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    popoverPosition = {
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    }
  }

  function handleInsertLeft(morphemeId: string) {
    clickedMorphemeId = null
    insertingLeft = morphemeId
    insertValue = ''
  }

  function handleInsertRight(morphemeId: string) {
    clickedMorphemeId = null
    insertingRight = morphemeId
    insertValue = ''
  }

  function handleEdit(morphemeId: string) {
    clickedMorphemeId = null
    editingMorphemeId = morphemeId
    const morpheme = session.current?.morphemes.find(m => m.id === morphemeId)
    if (morpheme) {
      editingValue = morpheme.text
    }
  }

  function handleEditSubmit(morphemeId: string) {
    if (editingValue.trim().length > 0) {
      sessionStore.editMorphemeText(morphemeId, editingValue.trim())
      editingMorphemeId = null
      editingValue = ''
    }
  }

  function handleEditCancel() {
    editingMorphemeId = null
    editingValue = ''
  }

  function handleInsertSubmit(position: 'left' | 'right', morphemeId: string) {
    if (insertValue.trim().length > 0) {
      sessionStore.insertMorpheme(position, morphemeId, insertValue.trim())
      if (position === 'left') {
        insertingLeft = null
      } else {
        insertingRight = null
      }
      insertValue = ''
    }
  }

  function handleInsertCancel() {
    insertingLeft = null
    insertingRight = null
    insertValue = ''
  }

  function handleClickOutside() {
    if (clickedMorphemeId) {
      clickedMorphemeId = null
    }
  }

  $effect(() => {
    if (editingMorphemeId) {
      const input = document.querySelector(
        `[data-edit-input="${editingMorphemeId}"]`
      ) as HTMLInputElement
      if (input) {
        input.focus()
        input.select()
      }
    } else if (insertingLeft || insertingRight) {
      const input = document.querySelector(`[data-insert-input]`) as HTMLInputElement
      if (input) {
        input.focus()
      }
    }
  })
</script>

<div
  class="edit-text-action"
  onclick={handleClickOutside}
  role="presentation"
  onkeydown={e => {
    if (e.key === 'Escape') handleClickOutside()
  }}
>
  {#if session.current?.morphemes}
    <div class="morphemes-container">
      {#each session.current.morphemes as morpheme (morpheme.id)}
        {@const isClicked = clickedMorphemeId === morpheme.id}
        {@const isEditing = editingMorphemeId === morpheme.id}
        {@const isInsertingLeft = insertingLeft === morpheme.id}
        {@const isInsertingRight = insertingRight === morpheme.id}

        {#if isInsertingLeft}
          <div class="insert-container">
            <input
              data-insert-input
              type="text"
              bind:value={insertValue}
              onkeydown={e => {
                if (e.key === 'Enter') {
                  handleInsertSubmit('left', morpheme.id)
                } else if (e.key === 'Escape') {
                  handleInsertCancel()
                }
              }}
              onblur={handleInsertCancel}
              placeholder="insert text"
              class="insert-input"
              aria-label="Insert text to the left"
            />
          </div>
        {/if}

        {#if isEditing}
          <div class="edit-container">
            <input
              data-edit-input={morpheme.id}
              type="text"
              bind:value={editingValue}
              onkeydown={e => {
                if (e.key === 'Enter') {
                  handleEditSubmit(morpheme.id)
                } else if (e.key === 'Escape') {
                  handleEditCancel()
                }
              }}
              onblur={handleEditCancel}
              class="edit-input"
              aria-label="Edit morpheme text"
            />
          </div>
        {:else}
          <div
            class="morpheme-node"
            class:clicked={isClicked}
            onclick={e => handleMorphemeClick(e, morpheme.id)}
            onkeydown={e => handleMorphemeKeydown(e, morpheme.id)}
            role="button"
            tabindex="0"
            aria-label="Morpheme: {morpheme.text}"
          >
            <span class="morpheme-text">{morpheme.text}</span>

            {#if isClicked}
              <div class="popover" style="left: {popoverPosition.x}px; top: {popoverPosition.y}px;">
                <button
                  type="button"
                  class="popover-button"
                  onclick={e => {
                    e.stopPropagation()
                    handleInsertLeft(morpheme.id)
                  }}
                  aria-label="Insert left"
                >
                  <InsertLeft size={20} stroke="#eeeeee" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  class="popover-button"
                  onclick={e => {
                    e.stopPropagation()
                    handleEdit(morpheme.id)
                  }}
                  aria-label="Edit node"
                >
                  <EditNode size={20} stroke="#eeeeee" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  class="popover-button"
                  onclick={e => {
                    e.stopPropagation()
                    handleInsertRight(morpheme.id)
                  }}
                  aria-label="Insert right"
                >
                  <InsertRight size={20} stroke="#eeeeee" strokeWidth={1.5} />
                </button>
              </div>
            {/if}
          </div>
        {/if}

        {#if isInsertingRight}
          <div class="insert-container">
            <input
              data-insert-input
              type="text"
              bind:value={insertValue}
              onkeydown={e => {
                if (e.key === 'Enter') {
                  handleInsertSubmit('right', morpheme.id)
                } else if (e.key === 'Escape') {
                  handleInsertCancel()
                }
              }}
              onblur={handleInsertCancel}
              placeholder="insert text"
              class="insert-input"
              aria-label="Insert text to the right"
            />
          </div>
        {/if}
      {/each}
    </div>
  {:else}
    <div class="empty-state">
      <p>No text to edit. Add new text first.</p>
    </div>
  {/if}
</div>

<style>
  .edit-text-action {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    width: 100%;
    padding: 2rem;
    background-color: #222831;
  }

  .morphemes-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    max-width: 100%;
  }

  .morpheme-node {
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: transparent;
    color: #eeeeee;
    border-radius: 0.35rem;
    cursor: pointer;
    transition: background-color 0.2s;
    user-select: none;
  }

  .morpheme-node:hover {
    background-color: #31363f;
  }

  .morpheme-node.clicked {
    background-color: #31363f;
  }

  .morpheme-text {
    font-size: 1.25rem;
  }

  .edit-container,
  .insert-container {
    display: inline-block;
  }

  .edit-input,
  .insert-input {
    background-color: #31363f;
    border: 1px solid #76abae;
    border-radius: 0.35rem;
    padding: 0.5rem 1rem;
    color: #eeeeee;
    font-size: 1.25rem;
    min-width: 200px;
    outline: none;
  }

  .edit-input:focus,
  .insert-input:focus {
    border-color: #76abae;
    box-shadow: 0 0 0 2px rgba(118, 171, 174, 0.2);
  }

  .insert-input::placeholder {
    color: #76abae;
    opacity: 0.6;
  }

  .popover {
    position: fixed;
    display: flex;
    gap: 0.5rem;
    background-color: #31363f;
    padding: 0.5rem;
    border-radius: 0.35rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    transform: translate(-50%, -100%);
    margin-top: -0.5rem;
    z-index: 100;
  }

  .popover-button {
    background: transparent;
    border: none;
    padding: 0.5rem;
    border-radius: 0.25rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
    color: #eeeeee;
  }

  .popover-button:hover {
    background-color: #415780;
  }

  .empty-state {
    color: #76abae;
    font-size: 1.25rem;
    text-align: center;
  }
</style>
