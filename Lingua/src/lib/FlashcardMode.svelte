<script lang="ts">
  import NavigationBar from './NavigationBar.svelte'
  import Toolbar from './Toolbar.svelte'
  import { listFlashcards, type Flashcard } from './services/flashcardService'
  import ProfileModal from './ProfileModal.svelte'
  import DeckLibraryModal from './DeckLibraryModal.svelte'
  import AddFlashcardModal from './components/create/AddFlashcardModal.svelte'
  import FlashcardIcon from '@icons/Flashcard.svelte'
  import InsertRight from '@icons/InsertRight.svelte'
  import InsertLeft from '@icons/InsertLeft.svelte'
  import CheckIcon from '@icons/CheckIcon.svelte'
  import XIcon from '@icons/XIcon.svelte'
  
  type ToolbarMode = 'parsing' | 'flashcard'
  
  let { 
    mode, 
    onModeChange 
  }: { 
    mode: ToolbarMode
    onModeChange: (mode: ToolbarMode) => void 
  } = $props()

  let typeFilter: 'vocab' | 'grammar' = $state('vocab')
  let isLoading = $state(false)
  let error: string | null = $state(null)
  let cards: Flashcard[] = $state([])
  let currentIndex = $state(0)
  let isFlipped = $state(false)
  let touchStartX = 0
  let touchStartY = 0

  let showAddFlashcard = $state(false)
  let showProfile = $state(false)
  let showDeckLibrary = $state(false)

  async function loadCards() {
    isLoading = true
    error = null
    try {
      cards = await listFlashcards(typeFilter)
      currentIndex = 0
      isFlipped = false
    } catch (e) {
      error = 'Failed to load flashcards'
      cards = []
    } finally {
      isLoading = false
    }
  }

  // Reload when the type filter changes
  $effect(() => {
    // track dependency
    typeFilter
    loadCards()
  })

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

<NavigationBar onOpenDecks={() => (showDeckLibrary = true)} onOpenProfile={() => (showProfile = true)} />
<Toolbar 
  mode={mode} 
  onModeChange={onModeChange}
  onActionClick={(action) => { if (action === 'add-flashcard') showAddFlashcard = true }}
/>
<div class="flashcard-mode">
  <div class="filters">
    <button class="chip" class:active={typeFilter === 'vocab'} type="button" onclick={() => (typeFilter = 'vocab')} aria-pressed={typeFilter === 'vocab'}>Vocab</button>
    <button class="chip" class:active={typeFilter === 'grammar'} type="button" onclick={() => (typeFilter = 'grammar')} aria-pressed={typeFilter === 'grammar'}>Grammar</button>
  </div>

  {#if isLoading}
    <div class="state">Loading…</div>
  {:else if error}
    <div class="state error">{error}</div>
  {:else if cards.length === 0}
    <div class="state">No {typeFilter} flashcards yet.</div>
  {:else}
    <div class="flashcard-wrap">
      <div class="flashcard-frame">
        <!-- backdrop for depth -->
        <div class="frame-backdrop" aria-hidden="true"></div>
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
          <button class="btn" type="button" onclick={flipCard} aria-label="Flip card">
            <FlashcardIcon size={22} stroke="#eeeeee" strokeWidth={1.5} />
          </button>
          <button class="btn" type="button" onclick={nextCard} aria-label="Next card">
            <InsertRight size={22} stroke="#eeeeee" strokeWidth={1.5} />
          </button>
          <button class="btn" type="button" onclick={shuffleDeck} aria-label="Shuffle deck">
            <span class="btn-text">Shuffle</span>
          </button>
        {:else}
          <!-- placeholder to preserve grid width in review mode -->
          <button class="btn placeholder" type="button" aria-hidden="true" disabled></button>
          <button class="btn correct" type="button" onclick={nextCard} aria-label="Mark correct and continue">
            <CheckIcon size={22} stroke="#eeeeee" strokeWidth={1.5} />
          </button>
          <button class="btn incorrect" type="button" onclick={nextCard} aria-label="Mark incorrect and continue">
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
<ProfileModal open={showProfile} onClose={() => (showProfile = false)} />
<DeckLibraryModal open={showDeckLibrary} onClose={() => (showDeckLibrary = false)} />

<style>
  .flashcard-mode {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 1.5rem 1rem;
    padding-top: calc(56px + 64px + 1.5rem); /* Navigation bar (56px) + Toolbar (~64px) + padding */
  }
  
  .filters {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 1rem;
  }
  .chip {
    background: transparent;
    border: 1px solid #415780;
    color: #eeeeee;
    padding: 0.35rem 0.75rem;
    border-radius: 6px;
    cursor: pointer;
  }
  .chip.active { border-color: #76abae; }

  .state { text-align: center; color: #eeeeee; opacity: 0.9; }
  .state.error { color: #ffb4b4; }

  .flashcard-wrap {
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

  .frame-backdrop {
    position: absolute;
    inset: -2px;
    border-radius: 18px;
    background-color: #222831;
    z-index: 0;
  }

  .flashcard {
    position: relative;
    width: calc(100% - 4px);
    height: calc(100% - 4px);
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
    background: var(--color-section);
    color: #76abae;
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
    grid-template-columns: repeat(3, 1fr);
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

