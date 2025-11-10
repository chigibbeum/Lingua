<script lang="ts">
  import { sessionStore } from '@lib/stores/session'
  import type { SessionState, MorphemeMeta } from '@lib/stores/session'
  import Break from '@icons/Break.svelte'
  import Combine from '@icons/Combine.svelte'
  import VocabNote from '@icons/VocabNote.svelte'
  import GrammarNote from '@icons/GrammarNote.svelte'
  import VocabularyNoteModal from './VocabularyNoteModal.svelte'
  import GrammarNoteModal from './GrammarNoteModal.svelte'
  
  let selectedMorphemes = $state<string[]>([])
  let hoveredMorphemeId = $state<string | null>(null)
  let showBreakInput = $state<string | null>(null)
  let breakInputValue = $state('')
  let showVocabNoteModal = $state(false)
  let showGrammarNoteModal = $state(false)
  let noteMorphemeId = $state<string>('')
  let popoverPositions = $state<Record<string, { x: number; y: number }>>({})
  let lastSelectedId: string | null = $state(null)
  
  let session = $state<SessionState>({ mode: 'idle', current: null })
  
  $effect(() => {
    const unsubscribe = sessionStore.subscribe(state => {
      session = state
      if (state.mode !== 'parsing' || !state.current?.morphemes.length) {
        selectedMorphemes = []
        hoveredMorphemeId = null
        showBreakInput = null
        breakInputValue = ''
      }
    })
    return unsubscribe
  })
  
  function handleMorphemeClick(e: MouseEvent, morphemeId: string) {
    e.stopPropagation()
    if (showBreakInput === morphemeId) return

    const isToggle = e.metaKey || e.ctrlKey
    const isRange = e.shiftKey

    if (isToggle) {
      if (selectedMorphemes.includes(morphemeId)) {
        selectedMorphemes = selectedMorphemes.filter(id => id !== morphemeId)
      } else {
        selectedMorphemes = [...selectedMorphemes, morphemeId]
      }
      lastSelectedId = morphemeId
    } else if (isRange) {
      const morphemes: MorphemeMeta[] = session.current?.morphemes ?? []
      const anchorId = lastSelectedId || selectedMorphemes[selectedMorphemes.length - 1] || morphemeId
      const startIndex = Math.max(0, morphemes.findIndex(m => m.id === anchorId))
      const endIndex = Math.max(0, morphemes.findIndex(m => m.id === morphemeId))
      if (startIndex !== -1 && endIndex !== -1) {
        const [from, to] = startIndex <= endIndex ? [startIndex, endIndex] : [endIndex, startIndex]
        const rangeIds = morphemes.slice(from, to + 1).map(m => m.id)
        // Merge unique ids preserving order
        const existing = new Set(selectedMorphemes)
        const merged = [...selectedMorphemes]
        for (const id of rangeIds) if (!existing.has(id)) merged.push(id)
        selectedMorphemes = merged
      } else {
        selectedMorphemes = [morphemeId]
      }
      lastSelectedId = morphemeId
    } else {
      selectedMorphemes = [morphemeId]
      lastSelectedId = morphemeId
    }

    updatePopoverPosition(e, morphemeId)
  }
  
  function handleMorphemeHover(e: MouseEvent, morphemeId: string) {
    if (selectedMorphemes.length === 0) {
      hoveredMorphemeId = morphemeId
      updatePopoverPosition(e, morphemeId)
    }
  }
  
  function handleMorphemeLeave() {
    if (selectedMorphemes.length === 0) {
      hoveredMorphemeId = null
    }
  }
  
  function updatePopoverPosition(e: MouseEvent, morphemeId: string) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    popoverPositions[morphemeId] = {
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    }
    popoverPositions = { ...popoverPositions }
  }
  
  function handleBreak(morphemeId: string) {
    showBreakInput = morphemeId
    breakInputValue = ''
    const morpheme = session.current?.morphemes.find(m => m.id === morphemeId)
    if (morpheme) {
      breakInputValue = morpheme.text
    }
    selectedMorphemes = []
    hoveredMorphemeId = null
  }
  
  function handleBreakKeydown(e: KeyboardEvent, morphemeId: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const input = e.target as HTMLInputElement
      const cursorPos = input.selectionStart || 0
      // Store handles validation - will not break if result would be empty
      sessionStore.breakMorpheme(morphemeId, cursorPos)
      showBreakInput = null
      breakInputValue = ''
    } else if (e.key === 'Escape') {
      showBreakInput = null
      breakInputValue = ''
    }
  }
  
  function handleCombine() {
    if (selectedMorphemes.length >= 2) {
      sessionStore.combineMorphemes(selectedMorphemes)
      selectedMorphemes = []
    }
  }
  
  function handleAddVocabNote(morphemeId: string) {
    noteMorphemeId = morphemeId
    showVocabNoteModal = true
    selectedMorphemes = []
    hoveredMorphemeId = null
  }

  function handleAddGrammarNote(morphemeId: string) {
    noteMorphemeId = morphemeId
    showGrammarNoteModal = true
    selectedMorphemes = []
    hoveredMorphemeId = null
  }
  
  function handleNoteAdded(
    morphemeId: string,
    payload: { type: 'vocab'; target: string; native: string } | { type: 'grammar'; text: string }
  ) {
    sessionStore.addNoteToMorpheme(morphemeId, payload)
  }
  
  function handleClickOutside() {
    if (selectedMorphemes.length > 0 && showBreakInput === null) {
      selectedMorphemes = []
    }
    hoveredMorphemeId = null
  }
  
  $effect(() => {
    if (showBreakInput) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        const input = document.querySelector(`[data-break-input="${showBreakInput}"]`) as HTMLInputElement
        if (input) {
          input.focus()
          // Set cursor to end of text by default
          const cursorPos = input.value.length
          input.setSelectionRange(cursorPos, cursorPos)
        }
      }, 0)
    }
  })
</script>

<div
  class="parse-text-action"
  role="button"
  aria-label="Clear selection"
  tabindex="0"
  onclick={handleClickOutside}
  onkeydown={(e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') handleClickOutside() }}
>
  {#if session.current?.morphemes}
    <div class="morphemes-container">
      {#each session.current.morphemes as morpheme (morpheme.id)}
        {@const isSelected = selectedMorphemes.includes(morpheme.id)}
        {@const isHovered = hoveredMorphemeId === morpheme.id && selectedMorphemes.length === 0}
        {@const hasNote = morpheme.notes.length > 0}
        {@const showPopover = (isSelected || isHovered) && showBreakInput !== morpheme.id}
        {@const showSinglePopover = showPopover && (isSelected ? selectedMorphemes.length === 1 : isHovered)}
        {@const isFirstSelected = isSelected && morpheme.id === selectedMorphemes[0]}
        {@const showMultiPopover = showPopover && isFirstSelected && selectedMorphemes.length >= 2}
        
        {#if showBreakInput === morpheme.id}
          <div class="morpheme-break-container">
            <input
              data-break-input={morpheme.id}
              type="text"
              bind:value={breakInputValue}
              onkeydown={(e) => handleBreakKeydown(e, morpheme.id)}
              class="break-input"
              aria-label="Break morpheme at cursor position"
            />
          </div>
        {:else}
          <div
            class="morpheme-node"
            class:selected={isSelected}
            class:has-note={hasNote}
            onclick={(e) => handleMorphemeClick(e, morpheme.id)}
            onmouseenter={(e) => handleMorphemeHover(e, morpheme.id)}
            onmouseleave={handleMorphemeLeave}
            role="button"
            tabindex="0"
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleMorphemeClick(e as unknown as MouseEvent, morpheme.id) }}
            aria-label="Morpheme: {morpheme.text}"
          >
            {#if morpheme.notes.some(n => n.type === 'vocab')}
              <div class="note-row note-top">
                {#each morpheme.notes.filter(n => n.type === 'vocab') as n}
                  <span class="note-chip">{n.target}</span>
                {/each}
              </div>
            {/if}

            <div class="text-row">
              <span class="morpheme-text">{morpheme.text}</span>
            </div>

            {#if morpheme.notes.some(n => n.type === 'grammar')}
              <div class="note-row note-bottom">
                {#each morpheme.notes.filter(n => n.type === 'grammar') as n}
                  <span class="note-chip">{n.text}</span>
                {/each}
              </div>
            {/if}
            
            {#if showSinglePopover}
              {@const position = popoverPositions[morpheme.id] || { x: 0, y: 0 }}
              <div class="popover" style="left: {position.x}px; top: {position.y}px;">
                <button
                  type="button"
                  class="popover-button"
                  onclick={(e) => { e.stopPropagation(); handleBreak(morpheme.id); }}
                  aria-label="Break morpheme"
                >
                  <Break size={20} stroke="#eeeeee" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  class="popover-button"
                  onclick={(e) => { e.stopPropagation(); handleAddVocabNote(morpheme.id); }}
                  aria-label="Vocabulary note"
                >
                  <VocabNote size={20} stroke="#eeeeee" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  class="popover-button"
                  onclick={(e) => { e.stopPropagation(); handleAddGrammarNote(morpheme.id); }}
                  aria-label="Grammar note"
                >
                  <GrammarNote size={20} stroke="#eeeeee" strokeWidth={1.5} />
                </button>
              </div>
            {/if}
            
            {#if showMultiPopover}
              {@const firstSelectedId = selectedMorphemes[0]!}
              {@const position = popoverPositions[firstSelectedId] || popoverPositions[morpheme.id] || { x: 0, y: 0 }}
              <div class="popover" style="left: {position.x}px; top: {position.y}px;">
                <button
                  type="button"
                  class="popover-button"
                  onclick={(e) => { e.stopPropagation(); handleCombine(); }}
                  aria-label="Combine"
                >
                  <Combine size={20} stroke="#eeeeee" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  class="popover-button"
                  onclick={(e) => { e.stopPropagation(); handleAddVocabNote(selectedMorphemes[0]!); }}
                  aria-label="Vocabulary note"
                >
                  <VocabNote size={20} stroke="#eeeeee" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  class="popover-button"
                  onclick={(e) => { e.stopPropagation(); handleAddGrammarNote(selectedMorphemes[0]!); }}
                  aria-label="Grammar note"
                >
                  <GrammarNote size={20} stroke="#eeeeee" strokeWidth={1.5} />
                </button>
              </div>
            {/if}
          </div>
        {/if}
      {/each}
    </div>
  {:else}
    <div class="empty-state">
      <p>No text to parse. Add new text first.</p>
    </div>
  {/if}
  
  <VocabularyNoteModal
    bind:isOpen={showVocabNoteModal}
    bind:morphemeId={noteMorphemeId}
    onNoteAdded={(id, payload) => {
      handleNoteAdded(id, payload)
    }}
  />
  <GrammarNoteModal
    bind:isOpen={showGrammarNoteModal}
    bind:morphemeId={noteMorphemeId}
    onNoteAdded={(id, payload) => {
      handleNoteAdded(id, payload)
    }}
  />
</div>

<style>
  .parse-text-action {
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
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    padding: 0.35rem 0.75rem;
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
  
  .morpheme-node.selected {
    background-color: #31363f;
  }
  
  .morpheme-node.has-note {
    background-color: #31363f;
  }
  
  .morpheme-text {
    font-size: 1.25rem;
  }

  .text-row {
    line-height: 1.2;
  }

  .note-row {
    color: #76abae;
    font-size: 0.85rem;
    line-height: 1.1;
    text-align: center;
  }

  .note-top { margin-bottom: 0.05rem; }
  .note-bottom { margin-top: 0.05rem; }

  .note-chip {
    color: #76abae;
  }

  .note-sep {
    opacity: 0.7;
    margin: 0 0.25rem;
  }
  
  /* Insert separators between chips without extra markup */
  .note-row .note-chip + .note-chip::before {
    content: '•';
    opacity: 0.7;
    margin: 0 0.25rem;
  }
  
  .note-indicator {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    font-size: 0.75rem;
    color: #76abae;
    font-weight: bold;
  }
  
  .morpheme-break-container {
    display: inline-block;
  }
  
  .break-input {
    background-color: #31363f;
    border: 1px solid #76abae;
    border-radius: 0.35rem;
    padding: 0.5rem 1rem;
    color: #eeeeee;
    font-size: 1.25rem;
    min-width: 200px;
    outline: none;
  }
  
  .break-input:focus {
    border-color: #76abae;
    box-shadow: 0 0 0 2px rgba(118, 171, 174, 0.2);
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

