<script lang="ts">
  /**
   * Parse Mode Component
   *
   * Main container for the parsing workflow. Delegates state coordination
   * to parseModeCoordinator following the "smart stores, dumb components" pattern.
   */
  import NavigationBar from '../layout/NavigationBar.svelte'
  import Toolbar from '../layout/Toolbar.svelte'
  import AddNewTextAction from '../parse/AddNewTextAction.svelte'
  import ParseTextAction from '../parse/ParseTextAction.svelte'
  import EditTextAction from '../parse/EditTextAction.svelte'
  import SentenceLibraryModal from '../modals/SentenceLibraryModal.svelte'
  import CreateFlashcardsModal from '../modals/CreateFlashcardsModal.svelte'
  import DeckLibraryModal from '../modals/DeckLibraryModal.svelte'
  import SettingsModal from '../modals/SettingsModal.svelte'
  import HistoryPanel from '../HistoryPanel.svelte'

  import { sessionStore, type SessionState } from '$lib/stores/session'
  import { parseUIStore, currentAction, activeToolbarAction, type ParseUIState } from '$lib/stores/parseUI'
  import { toastStore } from '$lib/stores/toast'
  import { handleToolbarAction, logFlashcardCreation } from '$lib/services/parseActions'
  import {
    initParseModeCoordination,
    initializeSession,
  } from '$lib/services/parseModeCoordinator'

  type ToolbarMode = 'parsing' | 'flashcard'

  let {
    mode,
    onModeChange,
    initialSession = null,
  }: {
    mode: ToolbarMode
    onModeChange: (_mode: ToolbarMode) => void
    initialSession?: SessionState | null
  } = $props()

  const toolbarMode = $derived(mode)
  const initialSessionSnapshot = $derived(initialSession)

  // ─────────────────────────────────────────────────────────────
  // Local Reactive State from Stores
  // ─────────────────────────────────────────────────────────────

  let session: SessionState = $state({
    mode: 'idle',
    current: null,
  })
  let uiState: ParseUIState = $state({
    currentAction: 'add-new',
    activeToolbarAction: 'new-text',
    hasUnsavedChanges: false,
    modals: {
      sentenceLibrary: false,
      createFlashcards: false,
      deckLibrary: false,
      settings: false,
      history: false,
    },
  })

  // ─────────────────────────────────────────────────────────────
  // Store Subscriptions
  // ─────────────────────────────────────────────────────────────

  $effect(() => {
    const unsubSession = sessionStore.subscribe(s => (session = s))
    const unsubUI = parseUIStore.subscribe(s => (uiState = s))
    return () => {
      unsubSession()
      unsubUI()
    }
  })

  // ─────────────────────────────────────────────────────────────
  // Coordination (delegated to service)
  // ─────────────────────────────────────────────────────────────

  $effect(() => {
    // Initialize coordination on mount
    const cleanup = initParseModeCoordination()
    return cleanup
  })

  // Initialize session (hydrate from snapshot if available)
  $effect(() => {
    if (session.mode === 'idle') {
      initializeSession(initialSessionSnapshot)
    }
  })
</script>

<NavigationBar
  onOpenSentences={() => parseUIStore.openModal('sentenceLibrary')}
  onOpenDecks={() => parseUIStore.openModal('deckLibrary')}
  onOpenSettings={() => parseUIStore.openModal('settings')}
/>
<Toolbar
  mode={toolbarMode}
  {onModeChange}
  onActionClick={action => handleToolbarAction(action, session)}
  activeAction={$activeToolbarAction}
/>

<div class="parse-mode">
  <div class="action-container">
    {#if $currentAction === 'add-new'}
      <AddNewTextAction />
    {:else if $currentAction === 'parse'}
      <ParseTextAction />
    {:else if $currentAction === 'edit'}
      <EditTextAction />
    {/if}
  </div>
</div>

<SentenceLibraryModal
  open={uiState.modals.sentenceLibrary}
  onClose={() => parseUIStore.closeModal('sentenceLibrary')}
/>
<DeckLibraryModal
  open={uiState.modals.deckLibrary}
  onClose={() => parseUIStore.closeModal('deckLibrary')}
/>
<SettingsModal
  open={uiState.modals.settings}
  onClose={() => parseUIStore.closeModal('settings')}
/>
<CreateFlashcardsModal
  bind:isOpen={uiState.modals.createFlashcards}
  session={session.current}
  onClose={() => parseUIStore.closeModal('createFlashcards')}
  onCreated={count => {
    if (count > 0) {
      toastStore.success(`${count} flashcard${count === 1 ? '' : 's'} created`)
      logFlashcardCreation(count, session)
    }
  }}
/>
<HistoryPanel
  open={uiState.modals.history}
  onClose={() => parseUIStore.closeModal('history')}
/>

<style>
  .parse-mode {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 1.5rem 1rem;
    padding-top: calc(56px + 64px + 1.5rem); /* Navigation bar (56px) + Toolbar (~64px) + padding */
    background-color: var(--lingua-bg-main);
  }

  .action-container {
    flex: 1;
    display: flex;
    width: 100%;
    transition: all 0.5s;
  }
</style>
