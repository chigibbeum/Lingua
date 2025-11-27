<script lang="ts">
import NewText from '$lib/icons/NewText.svelte'
import FlashcardMode from '$lib/icons/FlashcardMode.svelte'
import Abc from '$lib/icons/Abc.svelte'
import ParseText from '$lib/icons/ParseText.svelte'
import WandIcon from '$lib/icons/WandIcon.svelte'
import EditText from '$lib/icons/EditText.svelte'
import AddFlashcards from '$lib/icons/AddFlashcards.svelte'
import SaveNotes from '$lib/icons/SaveNotes.svelte'
import HistoryView from '$lib/icons/HistoryView.svelte'
import Filter from '$lib/icons/Filter.svelte'

  type ToolbarMode = 'parsing' | 'flashcard'

  let {
    mode,
    onModeChange,
    onActionClick = () => {},
    activeAction = null,
  }: {
    mode: ToolbarMode
    onModeChange: (_mode: ToolbarMode) => void
    onActionClick?: (_action: string) => void
    activeAction?: string | null
  } = $props()

  const toolbarMode = $derived(mode)
</script>

<div class="toolbar" role="toolbar" aria-label="Toolbar">
  <div class="toolbar-inner">
    <div class="tools">
      <!-- Left side: Mode switchers -->
      <button
        class="tool mode-switch"
        class:active={toolbarMode === 'parsing'}
        type="button"
        onclick={() => onModeChange('parsing')}
        aria-label="Switch to Parsing Mode"
      >
        <Abc size={24} stroke="var(--lingua-text-secondary)" strokeWidth={1.5} />
      </button>

      <button
        class="tool mode-switch"
        class:active={toolbarMode === 'flashcard'}
        type="button"
        onclick={() => onModeChange('flashcard')}
        aria-label="Switch to Flashcard Mode"
      >
        <FlashcardMode size={24} stroke="var(--lingua-text-secondary)" strokeWidth={1.5} />
      </button>

      <!-- Vertical divider -->
      <div class="divider" role="separator" aria-orientation="vertical"></div>

      <!-- Right side: Mode-specific icons -->
      {#if toolbarMode === 'parsing'}
        <button
          class="tool"
          class:active={activeAction === 'new-text'}
          type="button"
          aria-label="New Text"
          onclick={() => onActionClick('new-text')}
        >
          <NewText size={24} stroke="var(--lingua-text-secondary)" strokeWidth={1.5} />
        </button>
        <button
          class="tool"
          class:active={activeAction === 'parse'}
          type="button"
          aria-label="Parse Text"
          onclick={() => onActionClick('parse')}
        >
          <ParseText size={24} stroke="var(--lingua-text-secondary)" strokeWidth={1.5} />
        </button>
        <button
          class="tool"
          class:active={activeAction === 'auto-segment'}
          type="button"
          aria-label="Auto segment text"
          onclick={() => onActionClick('auto-segment')}
        >
          <WandIcon size={24} stroke="var(--lingua-text-secondary)" strokeWidth={1.5} />
        </button>
        <button
          class="tool"
          class:active={activeAction === 'edit'}
          type="button"
          aria-label="Edit Text"
          onclick={() => onActionClick('edit')}
        >
          <EditText size={24} stroke="var(--lingua-text-secondary)" strokeWidth={1.5} />
        </button>
        <button
          class="tool"
          class:active={activeAction === 'create-flashcard'}
          type="button"
          aria-label="Create Flashcards from sentence"
          onclick={() => onActionClick('create-flashcard')}
        >
          <AddFlashcards size={24} stroke="var(--lingua-text-secondary)" strokeWidth={1.5} />
        </button>
        <button
          class="tool"
          class:active={activeAction === 'save'}
          type="button"
          aria-label="Save Notes"
          onclick={() => onActionClick('save')}
        >
          <SaveNotes size={24} stroke="var(--lingua-text-secondary)" strokeWidth={1.5} />
        </button>
        <button
          class="tool"
          class:active={activeAction === 'history'}
          type="button"
          aria-label="History"
          onclick={() => onActionClick('history')}
        >
          <HistoryView size={24} stroke="var(--lingua-text-secondary)" strokeWidth={1.5} />
        </button>
      {:else if toolbarMode === 'flashcard'}
        <button
          class="tool"
          class:active={activeAction === 'add-flashcard'}
          type="button"
          aria-label="Add Flashcard"
          onclick={() => onActionClick('add-flashcard')}
        >
          <AddFlashcards size={24} stroke="var(--lingua-text-secondary)" strokeWidth={1.5} />
        </button>
        <button
          class="tool"
          class:active={activeAction === 'filter'}
          type="button"
          aria-label="Filter"
          onclick={() => onActionClick('filter')}
        >
          <Filter size={24} stroke="var(--lingua-text-secondary)" strokeWidth={1.5} />
        </button>
        <button
          class="tool"
          class:active={activeAction === 'save'}
          type="button"
          aria-label="Save Notes"
          onclick={() => onActionClick('save')}
        >
          <SaveNotes size={24} stroke="var(--lingua-text-secondary)" strokeWidth={1.5} />
        </button>
        <button
          class="tool"
          class:active={activeAction === 'history'}
          type="button"
          aria-label="History"
          onclick={() => onActionClick('history')}
        >
          <HistoryView size={24} stroke="var(--lingua-text-secondary)" strokeWidth={1.5} />
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .toolbar {
    position: fixed;
    top: 56px; /* Below navigation bar */
    left: 0;
    right: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 1rem 0;
    z-index: 999;
    background-color: transparent;
  }

  .toolbar-inner {
    background-color: var(--lingua-bg-section);
    padding: 0.75rem 1.5rem; /* px-6 = 1.5rem = 24px */
    border-radius: 0.5rem;
    transition: all 0.5s ease;
  }

  .tools {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin: 0;
    padding: 0;
    transition: all 0.5s ease;
  }

  .tool {
    background: transparent;
    border: 2px solid transparent;
    padding: 0.35rem;
    border-radius: 8px;
    color: var(--lingua-text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      background-color 0.2s,
      border-color 0.2s;
  }

  .tool:hover,
  .tool:focus-visible {
    outline: none;
    background-color: rgba(65, 87, 128, 0.2);
    box-shadow: 0 0 0 2px rgba(65, 87, 128, 0.4) inset;
  }

  .tool.active {
    border: 2px solid var(--lingua-accent);
  }

  .tool.active:hover,
  .tool.active:focus-visible {
    outline: none;
    background-color: rgba(65, 87, 128, 0.2);
    box-shadow: 0 0 0 2px rgba(65, 87, 128, 0.4) inset;
  }

  .mode-switch.active {
    background-color: var(--lingua-accent);
  }

  .mode-switch.active:hover,
  .mode-switch.active:focus-visible {
    background-color: var(--lingua-accent);
    box-shadow: none;
  }

  .divider {
    width: 1px;
    height: 24px;
    background-color: var(--lingua-divider);
    opacity: 0.5;
  }
</style>
