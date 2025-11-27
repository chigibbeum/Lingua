<script lang="ts">
  import { sessionStore } from '$lib/stores/session'
  import Break from '$lib/icons/Break.svelte'
  import Combine from '$lib/icons/Combine.svelte'
  import VocabNote from '$lib/icons/VocabNote.svelte'
  import GrammarNote from '$lib/icons/GrammarNote.svelte'

  import VocabularyNoteModal from '../modals/VocabularyNoteModal.svelte'
  import GrammarNoteModal from '../modals/GrammarNoteModal.svelte'

  import type { SessionState, MorphemeMeta, PosTag, Note } from '$lib/stores/session'

  let selectedMorphemes = $state<string[]>([])
  let hoveredMorphemeId = $state<string | null>(null)
  let showBreakInput = $state<string | null>(null)
  let breakInputValue = $state('')
  let showVocabNoteModal = $state(false)
  let showGrammarNoteModal = $state(false)
  let noteMorphemeId = $state<string>('')
  let popoverPositions = $state<Record<string, { x: number; y: number }>>({
})
  let lastSelectedId: string | null = $state(null)

  let session = $state<SessionState>({
 mode: 'idle', current: null 
})

  const isVocabNote = (note: Note): note is Extract<Note, { type: 'vocab' }> =>
    note.type === 'vocab'
  const isGrammarNote = (note: Note): note is Extract<Note, { type: 'grammar' }> =>
    note.type === 'grammar'

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

  function handleMorphemeSelection(
    morphemeId: string,
    modifiers: { metaKey: boolean; ctrlKey: boolean; shiftKey: boolean }
  ) {
    if (showBreakInput === morphemeId) return

    const isToggle = modifiers.metaKey || modifiers.ctrlKey
    const isRange = modifiers.shiftKey

    if (isToggle) {
      if (selectedMorphemes.includes(morphemeId)) {
        selectedMorphemes = selectedMorphemes.filter(id => id !== morphemeId)
      } else {
        selectedMorphemes = [...selectedMorphemes, morphemeId]
      }
      lastSelectedId = morphemeId
    } else if (isRange) {
      const morphemes: MorphemeMeta[] = session.current?.morphemes ?? []
      const anchorId =
        lastSelectedId || selectedMorphemes[selectedMorphemes.length - 1] || morphemeId
      const startIndex = Math.max(
        0,
        morphemes.findIndex(m => m.id === anchorId)
      )
      const endIndex = Math.max(
        0,
        morphemes.findIndex(m => m.id === morphemeId)
      )
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
  }

  function handleMorphemeClick(e: MouseEvent, morphemeId: string) {
    e.stopPropagation()
    handleMorphemeSelection(morphemeId, {
      metaKey: e.metaKey,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
    })
    updatePopoverPosition(e, morphemeId)
  }

  function handleMorphemeKeydown(e: KeyboardEvent, morphemeId: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      handleMorphemeSelection(morphemeId, {
        metaKey: e.metaKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
      })
      // Update popover position using the target element
      const target = e.currentTarget as HTMLElement
      if (target) {
        const rect = target.getBoundingClientRect()
        popoverPositions[morphemeId] = {
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        }
        popoverPositions = { ...popoverPositions }
      }
    }
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
    popoverPositions = {
 ...popoverPositions 
}
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
    payload:
      | { type: 'vocab'; target: string; native: string; pos?: PosTag }
      | { type: 'grammar'; text: string }
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
        const input = document.querySelector(
          `[data-break-input="${showBreakInput}"]`
        ) as HTMLInputElement
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
  onkeydown={e => {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') handleClickOutside()
  }}
>
  {#if session.current?.morphemes}
    <div class="morphemes-container">
      {#each session.current.morphemes as morpheme (morpheme.id)}
        {@const isSelected = selectedMorphemes.includes(morpheme.id)}
        {@const isHovered = hoveredMorphemeId === morpheme.id && selectedMorphemes.length === 0}
        {@const hasNote = morpheme.notes.length > 0}
        {@const showPopover = (isSelected || isHovered) && showBreakInput !== morpheme.id}
        {@const showSinglePopover =
          showPopover && (isSelected ? selectedMorphemes.length === 1 : isHovered)}
        {@const isFirstSelected = isSelected && morpheme.id === selectedMorphemes[0]}
        {@const showMultiPopover = showPopover && isFirstSelected && selectedMorphemes.length >= 2}
        {@const vocabNotes = morpheme.notes.filter(isVocabNote)}
        {@const grammarNotes = morpheme.notes.filter(isGrammarNote)}
        {@const primaryVocab = vocabNotes[0]}

        {#if showBreakInput === morpheme.id}
          <div class="morpheme-break-container">
            <input
              data-break-input={morpheme.id}
              type="text"
              bind:value={breakInputValue}
              onkeydown={e => handleBreakKeydown(e, morpheme.id)}
              class="break-input"
              aria-label="Break morpheme at cursor position"
            />
          </div>
        {:else}
          <div
            class="morpheme-node"
            class:selected={isSelected}
            class:has-note={hasNote}
            data-pos={primaryVocab?.pos ?? null}
            onclick={e => handleMorphemeClick(e, morpheme.id)}
            onmouseenter={e => handleMorphemeHover(e, morpheme.id)}
            onmouseleave={handleMorphemeLeave}
            role="button"
            tabindex="0"
            onkeydown={e => handleMorphemeKeydown(e, morpheme.id)}
            aria-label="Morpheme: {morpheme.text}"
          >
            {#if vocabNotes.length > 0}
              <div class="note-row note-top">
                {#each vocabNotes as n, index (n.id ?? `${morpheme.id}-vocab-${index}`)}
                  <span class="note-chip">{n.native}</span>
                {/each}
              </div>
            {/if}

            <div class="text-row">
              <span class="morpheme-text">{morpheme.text}</span>
            </div>

            {#if grammarNotes.length > 0}
              <div class="note-row note-bottom">
                {#each grammarNotes as n, index (n.id ?? `${morpheme.id}-grammar-${index}`)}
                  <span class="note-chip">{n.text}</span>
                {/each}
              </div>
            {/if}

            {#if showSinglePopover}
              {@const position = popoverPositions[morpheme.id] || {
 x: 0, y: 0 
}}
              <div class="popover" style="left: {position.x}px; top: {position.y}px;">
                <button
                  type="button"
                  class="popover-button"
                  onclick={e => {
                    e.stopPropagation()
                    handleBreak(morpheme.id)
                  }}
                  aria-label="Break morpheme"
                >
                  <Break size={20} stroke="#eeeeee" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  class="popover-button"
                  onclick={e => {
                    e.stopPropagation()
                    handleAddVocabNote(morpheme.id)
                  }}
                  aria-label="Vocabulary note"
                >
                  <VocabNote size={20} stroke="#eeeeee" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  class="popover-button"
                  onclick={e => {
                    e.stopPropagation()
                    handleAddGrammarNote(morpheme.id)
                  }}
                  aria-label="Grammar note"
                >
                  <GrammarNote size={20} stroke="#eeeeee" strokeWidth={1.5} />
                </button>
              </div>
            {/if}

            {#if showMultiPopover}
              {@const firstSelectedId = selectedMorphemes[0]!}
              {@const position = popoverPositions[firstSelectedId] ||
                popoverPositions[morpheme.id] || {
 x: 0, y: 0 
}}
              <div class="popover" style="left: {position.x}px; top: {position.y}px;">
                <button
                  type="button"
                  class="popover-button"
                  onclick={e => {
                    e.stopPropagation()
                    handleCombine()
                  }}
                  aria-label="Combine"
                >
                  <Combine size={20} stroke="#eeeeee" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  class="popover-button"
                  onclick={e => {
                    e.stopPropagation()
                    handleAddVocabNote(selectedMorphemes[0]!)
                  }}
                  aria-label="Vocabulary note"
                >
                  <VocabNote size={20} stroke="#eeeeee" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  class="popover-button"
                  onclick={e => {
                    e.stopPropagation()
                    handleAddGrammarNote(selectedMorphemes[0]!)
                  }}
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
    initialTarget={(
      session.current?.morphemes.find(m => m.id === noteMorphemeId)?.text ?? ''
    ).replace(/(^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$)/gu, '')}
    onNoteAdded={handleNoteAdded}
  />
  <GrammarNoteModal
    bind:isOpen={showGrammarNoteModal}
    bind:morphemeId={noteMorphemeId}
    morphemeText={(
      session.current?.morphemes.find(m => m.id === noteMorphemeId)?.text ?? ''
    ).replace(/(^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$)/gu, '')}
    onNoteAdded={handleNoteAdded}
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
    display: inline-block;
    padding: 0.05rem 0.35rem;
    border-radius: 0.3rem;
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

  .note-top {
    margin-bottom: 0.05rem;
  }
  .note-bottom {
    margin-top: 0.05rem;
  }

  .note-chip {
    color: #76abae;
  }

  /* Insert separators between chips without extra markup */
  .note-row .note-chip + .note-chip::before {
    content: '•';
    opacity: 0.7;
    margin: 0 0.25rem;
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

  /* POS highlight rules (background “pill” with fallback defaults) */
  .morpheme-node[data-pos='noun'] .morpheme-text {
    background-color: var(--pos-noun-bg, rgba(34, 197, 94, 0.22));
    border: 1px solid var(--pos-noun-bd, rgba(34, 197, 94, 0.45));
  }
  .morpheme-node[data-pos='verb'] .morpheme-text {
    background-color: var(--pos-verb-bg, rgba(59, 130, 246, 0.22));
    border: 1px solid var(--pos-verb-bd, rgba(59, 130, 246, 0.45));
  }
  .morpheme-node[data-pos='adjective'] .morpheme-text {
    background-color: var(--pos-adjective-bg, rgba(245, 158, 11, 0.22));
    border: 1px solid var(--pos-adjective-bd, rgba(245, 158, 11, 0.45));
  }
  .morpheme-node[data-pos='adverb'] .morpheme-text {
    background-color: var(--pos-adverb-bg, rgba(168, 85, 247, 0.22));
    border: 1px solid var(--pos-adverb-bd, rgba(168, 85, 247, 0.45));
  }
  .morpheme-node[data-pos='preposition'] .morpheme-text {
    background-color: var(--pos-preposition-bg, rgba(20, 184, 166, 0.22));
    border: 1px solid var(--pos-preposition-bd, rgba(20, 184, 166, 0.45));
  }
  .morpheme-node[data-pos='pronoun'] .morpheme-text {
    background-color: var(--pos-pronoun-bg, rgba(234, 179, 8, 0.22));
    border: 1px solid var(--pos-pronoun-bd, rgba(234, 179, 8, 0.45));
  }
  .morpheme-node[data-pos='conjunction'] .morpheme-text {
    background-color: var(--pos-conjunction-bg, rgba(239, 68, 68, 0.22));
    border: 1px solid var(--pos-conjunction-bd, rgba(239, 68, 68, 0.45));
  }
  .morpheme-node[data-pos='particle'] .morpheme-text {
    background-color: var(--pos-particle-bg, rgba(16, 185, 129, 0.22));
    border: 1px solid var(--pos-particle-bd, rgba(16, 185, 129, 0.45));
  }
</style>
