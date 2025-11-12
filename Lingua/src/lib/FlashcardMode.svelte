<script lang="ts">
  import NavigationBar from './NavigationBar.svelte'
  import Toolbar from './Toolbar.svelte'
  import { listFlashcards, type Flashcard } from './services/flashcardService'
  import ProfileModal from './ProfileModal.svelte'
  import DeckLibraryModal from './DeckLibraryModal.svelte'
  import SentenceLibraryModal from './SentenceLibraryModal.svelte'
  import SettingsModal from './SettingsModal.svelte'
  import AddFlashcardModal from './components/create/AddFlashcardModal.svelte'
  import ArrowBackIcon from '@icons/ArrowBackIcon.svelte'
  import FlipIcon from '@icons/FlipIcon.svelte'
  import ArrowForwardIcon from '@icons/ArrowForwardIcon.svelte'
  import ShuffleIcon from '@icons/ShuffleIcon.svelte'
  import CheckIcon from '@icons/CheckIcon.svelte'
  import XIcon from '@icons/XIcon.svelte'
  import { historyStore } from './stores/history'
  import HistoryPanel from './components/HistoryPanel.svelte'
  
  type ToolbarMode = 'parsing' | 'flashcard'
  
  let { 
    mode, 
    onModeChange 
  }: { 
    mode: ToolbarMode
    onModeChange: (mode: ToolbarMode) => void 
  } = $props()

  let isLoading = $state(false)
  let error: string | null = $state(null)
  let cards: Flashcard[] = $state([])
  let currentIndex = $state(0)
  let isFlipped = $state(false)
  let touchStartX = 0
  let touchStartY = 0

  let showAddFlashcard = $state(false)
  let showSentenceLibrary = $state(false)
  let showProfile = $state(false)
  let showDeckLibrary = $state(false)
  let showSettings = $state(false)
  let showHistory = $state(false)

  async function loadCards() {
    isLoading = true
    error = null
    try {
      cards = await listFlashcards()
      currentIndex = 0
      isFlipped = false
    } catch (e) {
      error = 'Failed to load flashcards'
      cards = []
    } finally {
      isLoading = false
    }
  }

  // Load cards on mount
  $effect(() => { loadCards() })

  function flipCard() {
    if (cards.length === 0) return
    isFlipped = !isFlipped
  }

  function nextCard() {
    if (cards.length === 0) return
    currentIndex = (currentIndex + 1) % cards.length
    isFlipped = false
  }

  function prevCard() {
    if (cards.length === 0) return
    currentIndex = (currentIndex - 1 + cards.length) % cards.length
    isFlipped = false
  }

  function markCorrect() {
    if (cards.length === 0) return
    const c = cards[currentIndex]
    historyStore.add({
      scope: 'flashcard',
      action: 'review',
      title: 'Reviewed card: Correct',
      description: c.type === 'vocab' ? `${c.front} → ${c.back}` : undefined,
      relatedId: c.id,
    })
    nextCard()
  }

  function markIncorrect() {
    if (cards.length === 0) return
    const c = cards[currentIndex]
    historyStore.add({
      scope: 'flashcard',
      action: 'review',
      title: 'Reviewed card: Incorrect',
      description: c.type === 'vocab' ? `${c.front} → ${c.back}` : undefined,
      relatedId: c.id,
    })
    nextCard()
  }

  function shuffleDeck() {
    if (cards.length < 2) return
    const arr = [...cards]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = arr[i]!
      arr[i] = arr[j]!
      arr[j] = tmp
    }
    cards = arr
    currentIndex = 0
    isFlipped = false
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault()
      flipCard()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      nextCard()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      prevCard()
    } else if ((e.key === 'h' || e.key === 'H') && (e.ctrlKey || e.metaKey) && e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      showHistory = !showHistory
    }
  }

  function onTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) return
    const t = e.touches.item(0)!
    touchStartX = t.clientX
    touchStartY = t.clientY
  }

  function onTouchEnd(e: TouchEvent) {
    if (e.changedTouches.length !== 1) return
    const ct = e.changedTouches.item(0)!
    const dx = ct.clientX - touchStartX
    const dy = ct.clientY - touchStartY
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)
    const threshold = 50
    if (absX > absY && absX > threshold) {
      // horizontal swipe
      if (dx < 0) nextCard()
      else prevCard()
    } else if (absY > threshold) {
      // vertical swipe
      flipCard()
    }
  }
</script>

<NavigationBar onOpenSentences={() => (showSentenceLibrary = true)} onOpenDecks={() => (showDeckLibrary = true)} onOpenProfile={() => (showProfile = true)} onOpenSettings={() => (showSettings = true)} />
<Toolbar 
  mode={mode} 
  onModeChange={onModeChange}
  onActionClick={(action) => { 
    if (action === 'add-flashcard') showAddFlashcard = true
    if (action === 'history') showHistory = !showHistory
  }}
/>
<div class="flashcard-mode">
  {#if isLoading}
    <div class="state">Loading…</div>
  {:else if error}
    <div class="state error">{error}</div>
  {:else if cards.length === 0}
    <div class="state">No flashcards yet.</div>
  {:else}
    <div class="flashcard-wrap">
      <div class="flashcard-frame">
        <!-- interactive flip card -->
        <div 
          class="flashcard" 
          class:flipped={isFlipped}
          role="button"
          tabindex="0"
          aria-label="Flashcard. Space flips. Left/Right to navigate."
          onclick={flipCard}
          onkeydown={handleKeydown}
          ontouchstart={onTouchStart}
          ontouchend={onTouchEnd}
        >
          <div class="face front">
            {cards[currentIndex]?.front}
          </div>
          <div class="face back">
            {cards[currentIndex]?.back}
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="controls" class:review={isFlipped}>
        {#if !isFlipped}
          <button class="btn" type="button" onclick={prevCard} aria-label="Previous card">
            <ArrowBackIcon size={22} stroke="#eeeeee" strokeWidth={1.5} />
          </button>
          <button class="btn" type="button" onclick={flipCard} aria-label="Flip card">
            <FlipIcon size={22} stroke="#eeeeee" strokeWidth={1.5} />
          </button>
          <button class="btn" type="button" onclick={nextCard} aria-label="Next card">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#eeeeee" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Forward">
              <title>Forward</title>
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M20 12l-10 0" />
              <path d="M20 12l-4 4" />
              <path d="M20 12l-4 -4" />
              <path d="M4 4l0 16" />
            </svg>
          </button>
          <button class="btn" type="button" onclick={shuffleDeck} aria-label="Shuffle deck">
            <ShuffleIcon size={22} stroke="#eeeeee" strokeWidth={1.5} />
          </button>
        {:else}
          <!-- placeholder to preserve grid width in review mode -->
          <button class="btn placeholder" type="button" aria-hidden="true" disabled></button>
          <button class="btn correct" type="button" onclick={markCorrect} aria-label="Mark correct and continue">
            <CheckIcon size={22} stroke="#eeeeee" strokeWidth={1.5} />
          </button>
          <button class="btn incorrect" type="button" onclick={markIncorrect} aria-label="Mark incorrect and continue">
            <XIcon size={22} stroke="#eeeeee" strokeWidth={1.5} />
          </button>
          <button class="btn placeholder" type="button" aria-hidden="true" disabled></button>
          {/if}
      </div>
    </div>
  {/if}
</div>

<AddFlashcardModal 
  bind:isOpen={showAddFlashcard} 
  onClose={() => (showAddFlashcard = false)}
  onCreated={(count) => { if (count > 0) loadCards() }}
/>
<SentenceLibraryModal open={showSentenceLibrary} onClose={() => (showSentenceLibrary = false)} />
<ProfileModal open={showProfile} onClose={() => (showProfile = false)} />
<DeckLibraryModal open={showDeckLibrary} onClose={() => (showDeckLibrary = false)} />
<SettingsModal open={showSettings} onClose={() => (showSettings = false)} />
<HistoryPanel open={showHistory} onClose={() => (showHistory = false)} />

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
  
  .filters {
    /* removed */
  }
  .chip {
    /* removed */
  }
  .chip.active { /* removed */ }

  .state { text-align: center; color: #eeeeee; opacity: 0.9; }
  .state.error { color: #ffb4b4; }

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
    .flashcard-frame { max-width: 350px; height: 220px; }
  }
  @media (max-width: 480px) {
    .flashcard-frame { max-width: 300px; height: 200px; }
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
  .flashcard.flipped { transform: rotateY(180deg); }

  @media (prefers-reduced-motion: reduce) {
    .flashcard { transition-duration: 200ms; }
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
  @media (max-width: 768px) { .face { font-size: 1.5rem; } }
  @media (max-width: 480px) { .face { font-size: 1.25rem; } }
  .face.back { transform: rotateY(180deg); }

  .controls {
    width: 100%;
    max-width: 420px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    min-height: 56px; /* anti-shift */
  }
  @media (max-width: 768px) { .controls { max-width: 350px; } }
  @media (max-width: 480px) {
    .controls { max-width: 300px; grid-template-columns: 1fr; }
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
  .btn:hover, .btn:focus-visible { background-color: #415780; outline: none; }
  .btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn.placeholder { visibility: hidden; pointer-events: none; }
  .btn-text { font-size: 0.9rem; }

  .correct { background-image: linear-gradient(135deg, #2e7d32, #1b5e20); }
  .incorrect { background-image: linear-gradient(135deg, #c62828, #8e0000); }
</style>

