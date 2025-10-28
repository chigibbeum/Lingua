<script lang="ts">
  import NewText from '@icons/NewText.svelte'
  import FlashcardMode from '@icons/FlashcardMode.svelte'
  import ParseText from '@icons/ParseText.svelte'
  import EditText from '@icons/EditText.svelte'
  import AddFlashcards from '@icons/AddFlashcards.svelte'
  import SaveNotes from '@icons/SaveNotes.svelte'
  import HistoryView from '@icons/HistoryView.svelte'

  let { size = 28, stroke = '#EEEEEE', strokeWidth = 1 } = $props()
</script>

<div class="toolbar" role="toolbar" aria-label="Text tools">
  <ul class="tools" role="list">
    <li>
      <button class="tool" type="button" aria-label="New Text">
        <NewText size={size} stroke={stroke} strokeWidth={strokeWidth} />
      </button>
    </li>
    <li>
      <button class="tool" type="button" aria-label="Flashcard Mode">
        <FlashcardMode size={size} fill="#EEEEEE" stroke="none" strokeWidth={0} />
      </button>
    </li>

    <li role="separator" aria-orientation="vertical" class="divider" style="height: {size}px;"></li>

    <li>
      <button class="tool" type="button" aria-label="Parse Text">
        <ParseText size={size} stroke={stroke} strokeWidth={strokeWidth} />
      </button>
    </li>
    <li>
      <button class="tool" type="button" aria-label="Edit Text">
        <EditText size={size} stroke={stroke} strokeWidth={strokeWidth} />
      </button>
    </li>
    <li>
      <button class="tool" type="button" aria-label="Create Flashcards">
        <AddFlashcards size={size} stroke={stroke} strokeWidth={strokeWidth} />
      </button>
    </li>
    <li>
      <button class="tool" type="button" aria-label="Save Notes">
        <SaveNotes size={size} stroke={stroke} strokeWidth={strokeWidth} />
      </button>
    </li>
    <li>
      <button class="tool" type="button" aria-label="Recent Activity">
        <HistoryView size={size} stroke={stroke} strokeWidth={strokeWidth} />
      </button>
    </li>
  </ul>
</div>

<style>
  .toolbar {
    width: 100%;
    background-color: #31363f; /* § 3.1 Section background */
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  .tools {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 0.5rem 1rem;
    margin: 0;
    list-style: none;
  }
  .tool {
    background: transparent;
    border: none;
    padding: 0.35rem;
    border-radius: 8px;
    color: #eeeeee;
    cursor: pointer;
  }
  .tool:hover,
  .tool:focus-visible {
    outline: none;
    background-color: rgba(65, 87, 128, 0.2); /* § 3.1 Button hover tone */
    box-shadow: 0 0 0 2px #41578066 inset;
  }
  .divider {
    width: 1px;
    background-color: rgba(238, 238, 238, 0.5);
  }
</style>


