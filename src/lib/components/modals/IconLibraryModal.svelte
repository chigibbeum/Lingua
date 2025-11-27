<script lang="ts">
  import DeleteGarbageIcon from '$lib/icons/DeleteGarbageIcon.svelte'
  import SentenceLibrary from '$lib/icons/SentenceLibrary.svelte'
  import FlashcardMode from '$lib/icons/FlashcardMode.svelte'
  import HistoryView from '$lib/icons/HistoryView.svelte'
  import NewText from '$lib/icons/NewText.svelte'
  import SaveNotes from '$lib/icons/SaveNotes.svelte'
  import EditText from '$lib/icons/EditText.svelte'
  import Filter from '$lib/icons/Filter.svelte'
  import ParseText from '$lib/icons/ParseText.svelte'
  import ProfileIcon from '$lib/icons/ProfileIcon.svelte'
  import EditNode from '$lib/icons/EditNode.svelte'
  import GrammarNote from '$lib/icons/GrammarNote.svelte'
  import LanguageIcon from '$lib/icons/LanguageIcon.svelte'
  import SelectIcon from '$lib/icons/SelectIcon.svelte'
  import SelectAllIcon from '$lib/icons/SelectAllIcon.svelte'
  import SignInUpIcon from '$lib/icons/SignInUpIcon.svelte'
  import VocabNote from '$lib/icons/VocabNote.svelte'
  import CheckIcon from '$lib/icons/CheckIcon.svelte'
  import CheckAllIcon from '$lib/icons/CheckAllIcon.svelte'
  import XIcon from '$lib/icons/XIcon.svelte'
  import Break from '$lib/icons/Break.svelte'
  import Combine from '$lib/icons/Combine.svelte'
  import Calendar from '$lib/icons/Calendar.svelte'
  import Login from '$lib/icons/Login.svelte'
  import Open from '$lib/icons/Open.svelte'
  import AddFlashcards from '$lib/icons/AddFlashcards.svelte'
  import Abc from '$lib/icons/Abc.svelte'
  import DeckLibrary from '$lib/icons/DeckLibrary.svelte'
  import Collapse from '$lib/icons/Collapse.svelte'
  import InsertRight from '$lib/icons/InsertRight.svelte'
  import Settings from '$lib/icons/Settings.svelte'
  import Flashcard from '$lib/icons/Flashcard.svelte'
  import CheckSubmit from '$lib/icons/CheckSubmit.svelte'
  import AddNote from '$lib/icons/AddNote.svelte'
  import HowToUse from '$lib/icons/HowToUse.svelte'
  import Sort from '$lib/icons/Sort.svelte'
  import InsertLeft from '$lib/icons/InsertLeft.svelte'
  import ArrowBackIcon from '$lib/icons/ArrowBackIcon.svelte'
  import ArrowForwardIcon from '$lib/icons/ArrowForwardIcon.svelte'
  import Delete from '$lib/icons/Delete.svelte'
  import FlipIcon from '$lib/icons/FlipIcon.svelte'
  import HomeIcon from '$lib/icons/HomeIcon.svelte'
  import LogoLingua from '$lib/icons/LogoLingua.svelte'
  import Profile from '$lib/icons/Profile.svelte'
  import ShuffleIcon from '$lib/icons/ShuffleIcon.svelte'
  import SquareIcon from '$lib/icons/SquareIcon.svelte'

  let {
    open,
    onClose = () => {},
  }: {
    open: boolean
    onClose?: () => void
  } = $props()

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

  const icons = [
    {
 id: 'AddFlashcards', name: humanize('AddFlashcards'), component: AddFlashcards 
},
    {
 id: 'AddNote', name: humanize('AddNote'), component: AddNote 
},
    {
 id: 'Abc', name: humanize('Abc'), component: Abc 
},
    {
 id: 'Break', name: humanize('Break'), component: Break 
},
    {
 id: 'Calendar', name: humanize('Calendar'), component: Calendar 
},
    {
 id: 'Check', name: humanize('Check'), component: CheckIcon 
},
    {
 id: 'CheckAll', name: humanize('CheckAll'), component: CheckAllIcon 
},
    {
 id: 'CheckSubmit', name: humanize('CheckSubmit'), component: CheckSubmit 
},
    {
 id: 'Collapse', name: humanize('Collapse'), component: Collapse 
},
    {
 id: 'Combine', name: humanize('Combine'), component: Combine 
},
    {
 id: 'DeckLibrary', name: humanize('DeckLibrary'), component: DeckLibrary 
},
    {
 id: 'DeleteGarbage', name: humanize('DeleteGarbage'), component: DeleteGarbageIcon 
},
    {
 id: 'EditNode', name: humanize('EditNode'), component: EditNode 
},
    {
 id: 'EditText', name: humanize('EditText'), component: EditText 
},
    {
 id: 'Filter', name: humanize('Filter'), component: Filter 
},
    {
 id: 'Flashcard', name: humanize('Flashcard'), component: Flashcard 
},
    {
 id: 'FlashcardMode', name: humanize('FlashcardMode'), component: FlashcardMode 
},
    {
 id: 'GrammarNote', name: humanize('GrammarNote'), component: GrammarNote 
},
    {
 id: 'HistoryView', name: humanize('HistoryView'), component: HistoryView 
},
    {
 id: 'HowToUse', name: humanize('How To Use'), component: HowToUse 
},
    {
 id: 'InsertLeft', name: humanize('InsertLeft'), component: InsertLeft 
},
    {
 id: 'InsertRight', name: humanize('InsertRight'), component: InsertRight 
},
    {
 id: 'Language', name: humanize('Language'), component: LanguageIcon 
},
    {
 id: 'Login', name: humanize('Login'), component: Login 
},
    {
 id: 'NewText', name: humanize('NewText'), component: NewText 
},
    {
 id: 'Open', name: humanize('Open'), component: Open 
},
    {
 id: 'ParseText', name: humanize('ParseText'), component: ParseText 
},
    {
 id: 'ProfileIcon', name: humanize('ProfileIcon'), component: ProfileIcon 
},
    {
 id: 'SaveNotes', name: humanize('SaveNotes'), component: SaveNotes 
},
    {
 id: 'Select', name: humanize('Select'), component: SelectIcon 
},
    {
 id: 'SelectAll', name: humanize('SelectAll'), component: SelectAllIcon 
},
    {
 id: 'SentenceLibrary', name: humanize('SentenceLibrary'), component: SentenceLibrary 
},
    {
 id: 'Settings', name: humanize('Settings'), component: Settings 
},
    {
 id: 'SignInUp', name: humanize('Sign In / Up'), component: SignInUpIcon 
},
    {
 id: 'Sort', name: humanize('Sort'), component: Sort 
},
    {
 id: 'VocabNote', name: humanize('VocabNote'), component: VocabNote 
},
    {
 id: 'X', name: humanize('X'), component: XIcon 
},
    {
 id: 'ArrowBackIcon', name: humanize('ArrowBackIcon'), component: ArrowBackIcon 
},
    {
 id: 'ArrowForwardIcon', name: humanize('ArrowForwardIcon'), component: ArrowForwardIcon 
},
    {
 id: 'Delete', name: humanize('Delete'), component: Delete 
},
    {
 id: 'FlipIcon', name: humanize('FlipIcon'), component: FlipIcon 
},
    {
 id: 'HomeIcon', name: humanize('HomeIcon'), component: HomeIcon 
},
    {
 id: 'LogoLingua', name: humanize('LogoLingua'), component: LogoLingua 
},
    {
 id: 'Profile', name: humanize('Profile'), component: Profile 
},
    {
 id: 'ShuffleIcon', name: humanize('ShuffleIcon'), component: ShuffleIcon 
},
    {
 id: 'SquareIcon', name: humanize('SquareIcon'), component: SquareIcon 
},
  ] as const
</script>

{#if open}
  <div
    class="modal-backdrop"
    role="presentation"
    tabindex="-1"
    onclick={() => onClose()}
    onkeydown={e => {
      if (e.key === 'Escape') onClose()
    }}
  >
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-label="Icon Reference"
      tabindex="-1"
      onclick={e => e.stopPropagation()}
      onkeydown={e => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <div class="modal-header">
        <h2 class="modal-title">Icon Reference</h2>
        <button class="close-button" type="button" aria-label="Close" onclick={() => onClose()}
          >✕</button
        >
      </div>

      <div class="icon-list" role="list">
        {#each icons as item (item.id)}
          {@const Icon = item.component}
          <div class="icon-row" role="listitem">
            <Icon size={22} stroke="#eeeeee" strokeWidth={1.5} />
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
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
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
