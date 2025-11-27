<script lang="ts">
  import Abc from '$lib/icons/Abc.svelte'
  import AddFlashcards from '$lib/icons/AddFlashcards.svelte'
  import DeckLibrary from '$lib/icons/DeckLibrary.svelte'
  import FlashcardMode from '$lib/icons/FlashcardMode.svelte'
  import Filter from '$lib/icons/Filter.svelte'
  import HistoryView from '$lib/icons/HistoryView.svelte'
  import NewText from '$lib/icons/NewText.svelte'
  import ParseText from '$lib/icons/ParseText.svelte'
  import EditText from '$lib/icons/EditText.svelte'
  import SaveNotes from '$lib/icons/SaveNotes.svelte'
  import SentenceLibrary from '$lib/icons/SentenceLibrary.svelte'

  type Step = {
    id: string
    title: string
    description: string
    icon: typeof Abc
  }

  let {
    open,
    onClose = () => {},
  }: {
    open: boolean
    onClose?: () => void
  } = $props()

  const parsingSteps: Step[] = [
    {
      id: 'new-text',
      title: 'Start with New Text',
      description:
        'Tap the New Text icon to paste or type a sentence. Press Enter or Submit to tokenize it automatically.',
      icon: NewText,
    },
    {
      id: 'parse',
      title: 'Tokenize & annotate',
      description:
        'Use Parse Text tools to break or combine tokens, then add grammar or vocab notes inline as you go.',
      icon: ParseText,
    },
    {
      id: 'edit',
      title: 'Refine structure',
      description:
        'Switch to Edit Text when you need to insert missing words or tweak nodes before saving.',
      icon: EditText,
    },
    {
      id: 'save',
      title: 'Save notes + history',
      description:
        'Select Save Notes to capture tags, metadata, and timestamps. Everything is logged in History automatically.',
      icon: SaveNotes,
    },
  ]

  const flashcardSteps: Step[] = [
    {
      id: 'switch-mode',
      title: 'Swap to Flashcard mode',
      description:
        'Use the Flashcard Mode toggle (right of Abc) to jump into review without changing layout.',
      icon: FlashcardMode,
    },
    {
      id: 'generate-cards',
      title: 'Create cards from notes',
      description:
        'Launch the Create Flashcards action to turn vocab or grammar notes into ready-to-review cards.',
      icon: AddFlashcards,
    },
    {
      id: 'filter',
      title: 'Filter what you study',
      description:
        'Filter cards by deck, tag, or part of speech so every session targets exactly what you need.',
      icon: Filter,
    },
    {
      id: 'organize',
      title: 'Organize decks & reviews',
      description:
        'Open the Deck Library to group cards, track progress, and jump back into a recent review set.',
      icon: DeckLibrary,
    },
  ]

  const quickLinks = [
    {
      id: 'sentences',
      title: 'Sentence Library',
      description: 'Browse saved sentences, stats, and quick actions such as edit or delete.',
      icon: SentenceLibrary,
    },
    {
      id: 'history',
      title: 'History',
      description: 'View every parse, edit, and save event so you can rewind sessions confidently.',
      icon: HistoryView,
    },
  ] as const
</script>

{#if open}
  <div
    class="modal-backdrop"
    role="presentation"
    tabindex="-1"
    onclick={() => onClose()}
    onkeydown={event => {
      if (event.key === 'Escape') onClose()
    }}
  >
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-label="How to use Lingua"
      tabindex="-1"
      onclick={event => event.stopPropagation()}
      onkeydown={event => {
        if (event.key === 'Escape') onClose()
      }}
    >
      <div class="modal-header">
        <div>
          <p class="eyebrow">Quick reference</p>
          <h2 class="modal-title">How to use Lingua</h2>
        </div>
        <button class="close-button" type="button" aria-label="Close" onclick={() => onClose()}>✕</button>
      </div>

      <div class="modal-body">
      <section class="intro">
        <p>
          Move between parsing and flashcard practice with the toolbar toggles (
          <span class="inline-icon"><Abc size={18} stroke="#eeeeee" strokeWidth={1.5} /></span>
          /
          <span class="inline-icon">
            <FlashcardMode size={18} stroke="#eeeeee" strokeWidth={1.5} />
          </span>
          ). The dashboard layout stays steady, so only the right-side tools change for each mode.
        </p>
      </section>

      <div class="mode-grid" role="group" aria-label="Mode walkthrough">
        <article class="mode-card">
          <header>
            <div class="mode-icon">
              <Abc size={28} stroke="#eeeeee" strokeWidth={1.5} />
            </div>
            <div>
              <h3>Parsing workflow</h3>
              <p class="muted">Capture, tokenize, and annotate every sentence.</p>
            </div>
          </header>
          <ol class="step-list">
            {#each parsingSteps as step (step.id)}
              {@const Icon = step.icon}
              <li class="step">
                <div class="step-icon">
                  <Icon size={20} stroke="#eeeeee" strokeWidth={1.4} />
                </div>
                <div>
                  <p class="step-title">{step.title}</p>
                  <p class="step-description">{step.description}</p>
                </div>
              </li>
            {/each}
          </ol>
        </article>

        <article class="mode-card">
          <header>
            <div class="mode-icon">
              <FlashcardMode size={28} stroke="#eeeeee" strokeWidth={1.5} />
            </div>
            <div>
              <h3>Flashcard workflow</h3>
              <p class="muted">Turn notes into decks and keep reviews focused.</p>
            </div>
          </header>
          <ol class="step-list">
            {#each flashcardSteps as step (step.id)}
              {@const Icon = step.icon}
              <li class="step">
                <div class="step-icon">
                  <Icon size={20} stroke="#eeeeee" strokeWidth={1.4} />
                </div>
                <div>
                  <p class="step-title">{step.title}</p>
                  <p class="step-description">{step.description}</p>
                </div>
              </li>
            {/each}
          </ol>
        </article>
      </div>

      <section class="quick-links">
        <h4>Helpful views</h4>
        <div class="quick-grid">
          {#each quickLinks as item (item.id)}
            {@const Icon = item.icon}
            <div class="quick-card">
              <div class="quick-icon">
                <Icon size={22} stroke="#76abae" strokeWidth={1.4} />
              </div>
              <div>
                <p class="quick-title">{item.title}</p>
                <p class="quick-description">{item.description}</p>
              </div>
            </div>
          {/each}
        </div>
      </section>
      </div>

      <div class="modal-footer">
        <button type="button" class="primary" onclick={() => onClose()}>Got it</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
  }

  .modal {
    width: min(960px, 92vw);
    max-height: 88vh;
    background: #31363f;
    color: #eeeeee;
    border-radius: 10px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
    overflow: hidden;
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    margin: 1rem 0;
    padding-right: 0.35rem;
  }

  .modal-body::-webkit-scrollbar {
    width: 6px;
  }

  .modal-body::-webkit-scrollbar-track {
    background: rgba(118, 171, 174, 0.12);
    border-radius: 999px;
  }

  .modal-body::-webkit-scrollbar-thumb {
    background: #76abae;
    border-radius: 999px;
  }

  .modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .eyebrow {
    margin: 0;
    text-transform: uppercase;
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    opacity: 0.7;
  }

  .modal-title {
    margin: 0.15rem 0 0;
    font-size: 1.35rem;
  }

  .close-button {
    background: transparent;
    border: 1px solid rgba(238, 238, 238, 0.3);
    color: #eeeeee;
    border-radius: 6px;
    padding: 0.25rem 0.55rem;
    cursor: pointer;
  }

  .intro {
    margin: 1rem 0 0.5rem;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .inline-icon {
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
    margin: 0 0.15rem;
  }

  .mode-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
    margin-top: 0.75rem;
  }

  .mode-card {
    background: #2b3038;
    border-radius: 10px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-height: 320px;
  }

  .mode-card header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .mode-card h3 {
    margin: 0;
    font-size: 1.05rem;
  }

  .muted {
    margin: 0.15rem 0 0;
    color: rgba(238, 238, 238, 0.75);
    font-size: 0.9rem;
  }

  .mode-icon {
    width: 42px;
    height: 42px;
    border-radius: 999px;
    background: rgba(118, 171, 174, 0.18);
    display: grid;
    place-items: center;
  }

  .step-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .step {
    display: flex;
    gap: 0.65rem;
    padding: 0.45rem 0.35rem;
    border-radius: 8px;
    background: rgba(34, 38, 45, 0.75);
    border: 1px solid rgba(238, 238, 238, 0.06);
  }

  .step-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(118, 171, 174, 0.15);
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .step-title {
    margin: 0;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .step-description {
    margin: 0.15rem 0 0;
    font-size: 0.85rem;
    line-height: 1.4;
    color: rgba(238, 238, 238, 0.85);
  }

  .quick-links {
    margin-top: 1rem;
  }

  .quick-links h4 {
    margin: 0 0 0.5rem;
    font-size: 1rem;
  }

  .quick-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 0.6rem;
  }

  .quick-card {
    display: flex;
    gap: 0.55rem;
    padding: 0.65rem 0.75rem;
    background: #2b3038;
    border-radius: 8px;
    border: 1px solid rgba(238, 238, 238, 0.08);
  }

  .quick-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(118, 171, 174, 0.18);
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .quick-title {
    margin: 0;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .quick-description {
    margin: 0.15rem 0 0;
    font-size: 0.85rem;
    color: rgba(238, 238, 238, 0.8);
    line-height: 1.35;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 0.85rem;
    margin-top: 0.85rem;
    border-top: 1px solid rgba(238, 238, 238, 0.08);
  }

  .primary {
    background: transparent;
    border: 1px solid #76abae;
    color: #eeeeee;
    border-radius: 6px;
    padding: 0.45rem 0.9rem;
    cursor: pointer;
    transition:
      background-color 0.2s,
      color 0.2s;
  }

  .primary:hover,
  .close-button:hover {
    background: rgba(118, 171, 174, 0.15);
  }

  @media (max-width: 640px) {
    .modal {
      padding: 1rem;
    }

    .mode-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

