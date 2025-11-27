<script lang="ts">
  import ArrowBackIcon from '$lib/icons/ArrowBackIcon.svelte'
  import FlipIcon from '$lib/icons/FlipIcon.svelte'
  import ArrowForwardIcon from '$lib/icons/ArrowForwardIcon.svelte'
  import ShuffleIcon from '$lib/icons/ShuffleIcon.svelte'
  import CheckIcon from '$lib/icons/CheckIcon.svelte'
  import XIcon from '$lib/icons/XIcon.svelte'

  import NavigationBar from '../layout/NavigationBar.svelte'
  import Toolbar from '../layout/Toolbar.svelte'
  import DeckLibraryModal from '../modals/DeckLibraryModal.svelte'
  import SentenceLibraryModal from '../modals/SentenceLibraryModal.svelte'
  import SettingsModal from '../modals/SettingsModal.svelte'
  import AddFlashcardModal from '../create/AddFlashcardModal.svelte'
  import HistoryPanel from '../HistoryPanel.svelte'

  import type { Flashcard } from '$lib/services/flashcardService'
  import type { HistoryEntry } from '$lib/schemas/history'
  import { formatShortDate } from '$lib/utils/formatters'
  import {
    flashcardUIStore,
    currentCard,
    isFlipped as isFlippedStore,
    isLoading as isLoadingStore,
    error as errorStore,
    activeToolbarAction,
  } from '$lib/stores/flashcardUI'
  import {
    markCorrect,
    markIncorrect,
    handleToolbarAction,
    handleKeydown,
    handleTouchStart,
    handleTouchEnd,
  } from '$lib/services/flashcardActions'

  type ToolbarMode = 'parsing' | 'flashcard'

  let {
    mode,
    onModeChange,
    initialCards = [],
    historySnapshot = [],
  }: {
    mode: ToolbarMode
    onModeChange: (_mode: ToolbarMode) => void
    initialCards?: Flashcard[]
    historySnapshot?: HistoryEntry[]
  } = $props()

  const toolbarMode = $derived(mode)
  const historySnapshotDerived = $derived(historySnapshot)

  // Local reactive state from stores
  let uiState = $state({
    cards: [] as Flashcard[],
    currentIndex: 0,
    isFlipped: false,
    isLoading: false,
    error: null as string | null,
    activeToolbarAction: 'add-flashcard' as string | null,
    modals: {
      addFlashcard: false,
      sentenceLibrary: false,
      deckLibrary: false,
      settings: false,
      history: false,
    },
  })

  // Subscribe to store
  $effect(() => {
    const unsub = flashcardUIStore.subscribe(s => (uiState = s))
    return unsub
  })

  // Initialize cards on mount (using store's async method)
  $effect(() => {
    flashcardUIStore.initializeCards(initialCards)
  })

  // Handle card creation callback
  function onCardsCreated(count: number) {
    if (count > 0) {
      flashcardUIStore.loadCards()
    }
  }
</script>

<NavigationBar
  onOpenSentences={() => flashcardUIStore.openModal('sentenceLibrary')}
  onOpenDecks={() => flashcardUIStore.openModal('deckLibrary')}
  onOpenSettings={() => flashcardUIStore.openModal('settings')}
/>
<Toolbar
  mode={toolbarMode}
  onModeChange={onModeChange}
  onActionClick={handleToolbarAction}
  activeAction={$activeToolbarAction}
/>

{#if historySnapshotDerived.length}
  <section class="history-glance" aria-label="Recent flashcard reviews">
    <h2>Recent reviews</h2>
    <ul>
      {#each historySnapshotDerived.slice(0, 3) as entry}
        <li>
          <div>
            <p class="entry-title">{entry.title}</p>
            {#if entry.description}
              <p class="entry-description">{entry.description}</p>
            {/if}
          </div>
          <span class="entry-meta">{formatShortDate(entry.timestamp)}</span>
        </li>
      {/each}
    </ul>
  </section>
{/if}

<div class="flashcard-mode">
  {#if $isLoadingStore}
    <div class="state">Loading…</div>
  {:else if $errorStore}
    <div class="state error">{$errorStore}</div>
  {:else if uiState.cards.length === 0}
    <div class="state">No flashcards yet.</div>
  {:else}
    <div class="flashcard-wrap">
      <div class="flashcard-frame">
        <!-- interactive flip card -->
        <div
          class="flashcard"
          class:flipped={$isFlippedStore}
          role="button"
          tabindex="0"
          aria-label="Flashcard. Space flips. Left/Right to navigate."
          onclick={() => flashcardUIStore.flip()}
          onkeydown={handleKeydown}
          ontouchstart={handleTouchStart}
          ontouchend={handleTouchEnd}
        >
          <div class="face front">
            {$currentCard?.front}
          </div>
          <div class="face back">
            {$currentCard?.back}
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="controls" class:review={$isFlippedStore}>
        {#if !$isFlippedStore}
          <button
            class="btn"
            type="button"
            onclick={() => flashcardUIStore.prev()}
            aria-label="Previous card"
          >
            <ArrowBackIcon size={22} stroke="#eeeeee" strokeWidth={1.5} />
          </button>
          <button
            class="btn"
            type="button"
            onclick={() => flashcardUIStore.flip()}
            aria-label="Flip card"
          >
            <FlipIcon size={22} stroke="#eeeeee" strokeWidth={1.5} />
          </button>
          <button
            class="btn"
            type="button"
            onclick={() => flashcardUIStore.next()}
            aria-label="Next card"
          >
            <ArrowForwardIcon size={22} stroke="#eeeeee" strokeWidth={1.5} />
          </button>
          <button
            class="btn"
            type="button"
            onclick={() => flashcardUIStore.shuffle()}
            aria-label="Shuffle deck"
          >
            <ShuffleIcon size={22} stroke="#eeeeee" strokeWidth={1.5} />
          </button>
        {:else}
          <!-- placeholder to preserve grid width in review mode -->
          <button class="btn placeholder" type="button" aria-hidden="true" disabled></button>
          <button
            class="btn correct"
            type="button"
            onclick={markCorrect}
            aria-label="Mark correct and continue"
          >
            <CheckIcon size={22} stroke="#eeeeee" strokeWidth={1.5} />
          </button>
          <button
            class="btn incorrect"
            type="button"
            onclick={markIncorrect}
            aria-label="Mark incorrect and continue"
          >
            <XIcon size={22} stroke="#eeeeee" strokeWidth={1.5} />
          </button>
          <button class="btn placeholder" type="button" aria-hidden="true" disabled></button>
        {/if}
      </div>
    </div>
  {/if}
</div>

<AddFlashcardModal
  bind:isOpen={uiState.modals.addFlashcard}
  onClose={() => flashcardUIStore.closeModal('addFlashcard')}
  onCreated={onCardsCreated}
/>
<SentenceLibraryModal
  open={uiState.modals.sentenceLibrary}
  onClose={() => flashcardUIStore.closeModal('sentenceLibrary')}
/>
<DeckLibraryModal
  open={uiState.modals.deckLibrary}
  onClose={() => flashcardUIStore.closeModal('deckLibrary')}
/>
<SettingsModal
  open={uiState.modals.settings}
  onClose={() => flashcardUIStore.closeModal('settings')}
/>
<HistoryPanel
  open={uiState.modals.history}
  onClose={() => flashcardUIStore.closeModal('history')}
/>

<style>
  .flashcard-mode {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    padding: 1.5rem 1rem;
    padding-top: calc(56px + 64px); /* Navigation bar (56px) + Toolbar (~64px) */
  }

  .history-glance {
    width: min(900px, 100%);
    margin: calc(56px + 64px + 1rem) auto 0;
    padding: 1.5rem;
    border-radius: 0.35rem;
    background-color: #31363f;
    color: #eeeeee;
  }

  .history-glance h2 {
    margin: 0 0 0.75rem 0;
    font-size: 1rem;
  }

  .history-glance ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .history-glance li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border-radius: 0.35rem;
    background-color: #222831;
  }

  .entry-title {
    margin: 0;
    font-weight: 600;
  }

  .entry-description {
    margin: 0.25rem 0 0;
    color: #d1d5db;
    font-size: 0.9rem;
  }

  .entry-meta {
    font-size: 0.85rem;
    color: #a9bfc0;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    .history-glance {
      padding: 1rem;
      margin-top: calc(56px + 64px + 0.5rem);
    }

    .history-glance li {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .state {
    text-align: center;
    color: #eeeeee;
    opacity: 0.9;
  }
  .state.error {
    color: #ffb4b4;
  }

  .flashcard-wrap {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .flashcard-frame {
    position: relative;
    width: 100%;
    max-width: 420px;
    height: 260px;
    perspective: 1000px;
    display: grid;
    place-items: center;
  }

  @media (max-width: 768px) {
    .flashcard-frame {
      max-width: 350px;
      height: 220px;
    }
  }
  @media (max-width: 480px) {
    .flashcard-frame {
      max-width: 300px;
      height: 200px;
    }
  }

  .flashcard {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
    z-index: 1;
    border-radius: 16px;
  }
  .flashcard.flipped {
    transform: rotateY(180deg);
  }

  @media (prefers-reduced-motion: reduce) {
    .flashcard {
      transition-duration: 200ms;
    }
  }

  .face {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 1rem;
    background: #31363f;
    color: #ffffff;
    border-radius: 16px;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    text-align: center;
    font-size: 2rem;
  }
  @media (max-width: 768px) {
    .face {
      font-size: 1.5rem;
    }
  }
  @media (max-width: 480px) {
    .face {
      font-size: 1.25rem;
    }
  }
  .face.back {
    transform: rotateY(180deg);
  }

  .controls {
    width: 100%;
    max-width: 420px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    min-height: 56px; /* anti-shift */
  }
  @media (max-width: 768px) {
    .controls {
      max-width: 350px;
    }
  }
  @media (max-width: 480px) {
    .controls {
      max-width: 300px;
      grid-template-columns: 1fr;
    }
  }
  .controls.review {
    grid-template-columns: repeat(4, 1fr);
  }

  .btn {
    background-color: #31363f;
    color: #eeeeee;
    border: none;
    border-radius: 0.5rem;
    padding: 0.6rem 0.75rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.15s ease-in-out;
  }
  .btn:hover,
  .btn:focus-visible {
    background-color: #415780;
    outline: none;
  }
  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .btn.placeholder {
    visibility: hidden;
    pointer-events: none;
  }

  .correct {
    background-image: linear-gradient(135deg, #2e7d32, #1b5e20);
  }
  .incorrect {
    background-image: linear-gradient(135deg, #c62828, #8e0000);
  }
</style>
