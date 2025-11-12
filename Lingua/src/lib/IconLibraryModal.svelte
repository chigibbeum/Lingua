<script lang="ts">
  import DeleteGarbageIcon from '@icons/DeleteGarbageIcon.svelte'
  import SentenceLibrary from '@icons/SentenceLibrary.svelte'
  import FlashcardMode from '@icons/FlashcardMode.svelte'
  import HistoryView from '@icons/HistoryView.svelte'
  import NewText from '@icons/NewText.svelte'
  import SaveNotes from '@icons/SaveNotes.svelte'
  import EditText from '@icons/EditText.svelte'
  import Filter from '@icons/Filter.svelte'
  import ParseText from '@icons/ParseText.svelte'
  import ProfileIcon from '@icons/ProfileIcon.svelte'
  import EditNode from '@icons/EditNode.svelte'
  import GrammarNote from '@icons/GrammarNote.svelte'
  import LanguageIcon from '@icons/LanguageIcon.svelte'
  import SelectIcon from '@icons/SelectIcon.svelte'
  import SelectAllIcon from '@icons/SelectAllIcon.svelte'
  import SignInUpIcon from '@icons/SignInUpIcon.svelte'
  import VocabNote from '@icons/VocabNote.svelte'
  import CheckIcon from '@icons/CheckIcon.svelte'
  import CheckAllIcon from '@icons/CheckAllIcon.svelte'
  import XIcon from '@icons/XIcon.svelte'
  import Break from '@icons/Break.svelte'
  import Combine from '@icons/Combine.svelte'
  import Calendar from '@icons/Calendar.svelte'
  import Login from '@icons/Login.svelte'
  import Open from '@icons/Open.svelte'
  import AddFlashcards from '@icons/AddFlashcards.svelte'
  import Abc from '@icons/Abc.svelte'
  import DeckLibrary from '@icons/DeckLibrary.svelte'
  import Collapse from '@icons/Collapse.svelte'
  import InsertRight from '@icons/InsertRight.svelte'
  import Settings from '@icons/Settings.svelte'
  import Flashcard from '@icons/Flashcard.svelte'
  import CheckSubmit from '@icons/CheckSubmit.svelte'
  import AddNote from '@icons/AddNote.svelte'
  import HowToUse from '@icons/HowToUse.svelte'
  import Sort from '@icons/Sort.svelte'
  import InsertLeft from '@icons/InsertLeft.svelte'

  let {
    open,
    onClose = () => {},
  }: {
    open: boolean
    onClose?: () => void
  } = $props()

  type IconEntry = {
    name: string
    component: unknown
  }

  function humanize(name: string): string {
    // Remove common suffix
    name = name.replace(/Icon$/, '')
    // Insert spaces before capitals and numbers
    name = name.replace(/([a-z])([A-Z0-9])/g, '$1 $2')
    // Fix common abbreviations
    name = name.replace(/\bAbc\b/i, 'ABC')
    name = name.replace(/\bX\b/, 'X')
    return name.trim()
  }

  const icons: IconEntry[] = [
    { name: humanize('AddFlashcards'), component: AddFlashcards },
    { name: humanize('AddNote'), component: AddNote },
    { name: humanize('Abc'), component: Abc },
    { name: humanize('Break'), component: Break },
    { name: humanize('Calendar'), component: Calendar },
    { name: humanize('Check'), component: CheckIcon },
    { name: humanize('CheckAll'), component: CheckAllIcon },
    { name: humanize('CheckSubmit'), component: CheckSubmit },
    { name: humanize('Collapse'), component: Collapse },
    { name: humanize('Combine'), component: Combine },
    { name: humanize('DeckLibrary'), component: DeckLibrary },
    { name: humanize('DeleteGarbage'), component: DeleteGarbageIcon },
    { name: humanize('EditNode'), component: EditNode },
    { name: humanize('EditText'), component: EditText },
    { name: humanize('Filter'), component: Filter },
    { name: humanize('Flashcard'), component: Flashcard },
    { name: humanize('FlashcardMode'), component: FlashcardMode },
    { name: humanize('GrammarNote'), component: GrammarNote },
    { name: humanize('HistoryView'), component: HistoryView },
    { name: humanize('How To Use'), component: HowToUse },
    { name: humanize('InsertLeft'), component: InsertLeft },
    { name: humanize('InsertRight'), component: InsertRight },
    { name: humanize('Language'), component: LanguageIcon },
    { name: humanize('Login'), component: Login },
    { name: humanize('NewText'), component: NewText },
    { name: humanize('Open'), component: Open },
    { name: humanize('ParseText'), component: ParseText },
    { name: humanize('Profile'), component: ProfileIcon },
    { name: humanize('SaveNotes'), component: SaveNotes },
    { name: humanize('Select'), component: SelectIcon },
    { name: humanize('SelectAll'), component: SelectAllIcon },
    { name: humanize('SentenceLibrary'), component: SentenceLibrary },
    { name: humanize('Settings'), component: Settings },
    { name: humanize('Sign In / Up'), component: SignInUpIcon },
    { name: humanize('Sort'), component: Sort },
    { name: humanize('VocabNote'), component: VocabNote },
    { name: humanize('X'), component: XIcon },
  ]
</script>

{#if open}
  <div
    class="modal-backdrop"
    role="presentation"
    tabindex="-1"
    onclick={() => onClose()}
    onkeydown={(e) => { if (e.key === 'Escape') onClose() }}
  >
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-label="Icon Reference"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => { if (e.key === 'Escape') onClose() }}
    >
      <div class="modal-header">
        <h2 class="modal-title">Icon Reference</h2>
        <button class="close-button" type="button" aria-label="Close" onclick={() => onClose()}>✕</button>
      </div>

      <div class="icon-list" role="list">
        {#each icons as item (item.name)}
          <div class="icon-row" role="listitem">
            <!-- @ts-ignore -->
            <svelte:component this={item.component} size={22} stroke="#eeeeee" strokeWidth={1.5} />
            <span class="icon-label">{item.name}</span>
          </div>
        {/each}
      </div>

      <div class="modal-footer">
        <button type="button" class="primary" onclick={() => onClose()}>Close</button>
      </div>
    </div>
  </div>
{/if}

<style>
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
    width: min(720px, 92vw);
    max-height: 80vh;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 30px rgba(0,0,0,0.35);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .modal-title {
    margin: 0;
    font-size: 1.1rem;
  }

  .close-button {
    background: transparent;
    border: none;
    color: #eeeeee;
    cursor: pointer;
    border-radius: 6px;
    padding: 0.25rem 0.5rem;
  }

  .icon-list {
    overflow: auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.25rem;
    padding: 0.25rem 0;
  }

  .icon-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.4rem 0.25rem;
    border-bottom: 1px solid rgba(238, 238, 238, 0.08);
  }

  .icon-label {
    font-size: 0.95rem;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(238, 238, 238, 0.08);
    margin-top: 0.5rem;
  }

  .primary {
    background: transparent;
    border: 1px solid #76abae;
    color: #eeeeee;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
  }

  .primary:hover {
    background: rgba(118, 171, 174, 0.15);
  }
</style>


