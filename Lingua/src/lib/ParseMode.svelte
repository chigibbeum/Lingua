<script lang="ts">
  import NavigationBar from './NavigationBar.svelte'
  import Toolbar from './Toolbar.svelte'
  import AddNewTextAction from './components/AddNewTextAction.svelte'
  import ParseTextAction from './components/ParseTextAction.svelte'
  import EditTextAction from './components/EditTextAction.svelte'
  import SentenceLibraryModal from './SentenceLibraryModal.svelte'
  import ProfileModal from './ProfileModal.svelte'
  import CreateFlashcardsModal from './components/CreateFlashcardsModal.svelte'
  import DeckLibraryModal from './DeckLibraryModal.svelte'
  import SettingsModal from './SettingsModal.svelte'
  import { sessionStore, type SessionState } from './stores/session'
import { saveSession } from './services/sessionService'
import { saveSentenceWithNotes } from './services/sentenceService'
  import { isLoggedIn } from './stores/auth'
  import { historyStore } from './stores/history'
  import HistoryPanel from './components/HistoryPanel.svelte'
  
  type ToolbarMode = 'parsing' | 'flashcard'
  type ParsingAction = 'add-new' | 'parse' | 'edit'
  
  let { 
    mode, 
    onModeChange 
  }: { 
    mode: ToolbarMode
    onModeChange: (mode: ToolbarMode) => void 
  } = $props()
  
  let currentAction: ParsingAction = $state('add-new')
  let hasUnsavedChanges = $state(false)
  let showSentenceLibrary = $state(false)
  let showCreateFlashcards = $state(false)
  let showProfile = $state(false)
  let showDeckLibrary = $state(false)
  let showSettings = $state(false)
  let showHistory = $state(false)
  
  let session: SessionState = $state({ mode: 'idle', current: null })
  
  // Initialize on mount
  $effect(() => {
    if (session.mode === 'idle') {
      sessionStore.startNew()
    }
  })
  
  $effect(() => {
    const unsubscribe = sessionStore.subscribe(state => {
      session = state
      
      // Auto-switch to parse action after text is submitted
      if (state.mode === 'parsing' && ((state.current?.morphemes?.length ?? 0) > 0) && currentAction === 'add-new') {
        currentAction = 'parse'
      }
      
      // Reset to add-new when starting fresh
      if (state.mode === 'editing' && !state.current?.sentence) {
        currentAction = 'add-new'
      }

      // Derive unsaved changes: any typed sentence or any parsed morphemes
      const hasText = Boolean(state.current?.sentence && state.current.sentence.trim().length > 0)
      const hasMorphemes = Boolean(state.current?.morphemes?.length && state.current.morphemes.length > 0)
      hasUnsavedChanges = hasText || hasMorphemes
    })
    return unsubscribe
  })
  
  function handleActionChange(action: ParsingAction) {
    // If switching to add-new and there are unsaved changes, prompt user
    if (action === 'add-new' && hasUnsavedChanges && session.current?.morphemes?.length) {
      const shouldContinue = confirm('You have unsaved changes. Do you want to continue without saving?')
      if (!shouldContinue) return
    }
    
    currentAction = action
    hasUnsavedChanges = false
    
    // Reset to editing mode when switching to add-new
    if (action === 'add-new') {
      sessionStore.startNew()
    }
  }
  
  function handleToolbarActionClick(action: string) {
    switch (action) {
      case 'new-text':
        handleActionChange('add-new')
        break
      case 'parse':
        if ((session.current?.morphemes?.length ?? 0) > 0) {
          handleActionChange('parse')
          historyStore.add({
            scope: 'parse',
            action: 'parse',
            title: 'Parsed sentence',
            snippet: session.current?.sentence ?? undefined,
            relatedId: session.current?.id ?? undefined,
          })
        }
        break
      case 'edit':
        if ((session.current?.morphemes?.length ?? 0) > 0) {
          handleActionChange('edit')
        }
        break
      case 'create-flashcard':
        if (!$isLoggedIn) {
          alert('Please log in to create flashcards.')
          break
        }
        if (!session.current) {
          alert('No session loaded.')
          break
        }
        showCreateFlashcards = true
        break
      case 'save':
        if (session.mode !== 'parsing') {
          alert('Switch to parsing mode to save the typed sentence.')
          break
        }
        if (!$isLoggedIn) {
          alert('Please log in to save your sentence.')
          break
        }
        {
          const text = session.current?.sentence?.trim() ?? ''
          if (!text) {
            alert('Type a sentence before saving.')
            break
          }
          const morphemes = session.current?.morphemes ?? []
          const noteInputs = morphemes.flatMap(m =>
            m.notes.map(n =>
              n.type === 'vocab'
                ? {
                    type: 'vocab' as const,
                    target: n.target,
                    native: n.native,
                    ...(('pos' in n && n.pos) ? { pos: n.pos } : {}),
                    morphemeText: m.text,
                  }
                : { type: 'grammar' as const, text: n.text, morphemeText: m.text }
            )
          )

          saveSentenceWithNotes(text, noteInputs)
            .then(() => {
              const count = noteInputs.length
              alert(`Saved sentence${count ? ` with ${count} note${count === 1 ? '' : 's'}` : ''}`)
              historyStore.add({
                scope: 'parse',
                action: 'save',
                title: 'Saved sentence',
                description: count ? `Saved ${count} note${count === 1 ? '' : 's'}` : undefined,
                snippet: text,
                relatedId: session.current?.id ?? undefined,
              })
              // After saving, reset to "new text" flow
              sessionStore.startNew()
              currentAction = 'add-new'
              hasUnsavedChanges = false
            })
            .catch((e) => {
              console.error('Failed to save sentence and notes', e)
              const msg = (e && e.code === 'permission-denied')
                ? 'No permission to save. Check Firestore rules.'
                : 'Failed to save sentence and notes. Try again.'
              alert(msg)
            })
        }
        break
      case 'history':
        showHistory = !showHistory
        break
    }
  }

  // Keyboard shortcut: Ctrl/Command+Shift+H toggles history panel
  $effect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isHistoryCombo =
        (e.key === 'h' || e.key === 'H') && (e.ctrlKey || e.metaKey) && e.shiftKey
      if (!isHistoryCombo) return
      e.preventDefault()
      e.stopPropagation()
      showHistory = !showHistory
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
</script>

<NavigationBar onOpenSentences={() => (showSentenceLibrary = true)} onOpenDecks={() => (showDeckLibrary = true)} onOpenProfile={() => (showProfile = true)} onOpenSettings={() => (showSettings = true)} />
<Toolbar 
  mode={mode} 
  onModeChange={onModeChange} 
  onActionClick={handleToolbarActionClick}
  activeAction={currentAction === 'add-new' ? 'new-text' : currentAction === 'parse' ? 'parse' : currentAction === 'edit' ? 'edit' : null}
/>
<div class="parse-mode">
  <div class="action-container">
    {#if currentAction === 'add-new'}
      <AddNewTextAction />
    {:else if currentAction === 'parse'}
      <ParseTextAction />
    {:else if currentAction === 'edit'}
      <EditTextAction />
    {/if}
  </div>
</div>

<SentenceLibraryModal open={showSentenceLibrary} onClose={() => (showSentenceLibrary = false)} />
<DeckLibraryModal open={showDeckLibrary} onClose={() => (showDeckLibrary = false)} />
<ProfileModal open={showProfile} onClose={() => (showProfile = false)} />
<SettingsModal open={showSettings} onClose={() => (showSettings = false)} />
<CreateFlashcardsModal
  bind:isOpen={showCreateFlashcards}
  session={session.current}
  onClose={() => (showCreateFlashcards = false)}
  onCreated={(count) => {
    if (count > 0) alert(`${count} flashcard${count === 1 ? '' : 's'} created`)
    if (count > 0) {
      historyStore.add({
        scope: 'parse',
        action: 'create-flashcard',
        title: `Created ${count} flashcard${count === 1 ? '' : 's'}`,
        snippet: session.current?.sentence ?? undefined,
        relatedId: session.current?.id ?? undefined,
      })
    }
  }}
/>
<HistoryPanel open={showHistory} onClose={() => (showHistory = false)} />

<style>
  .parse-mode {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 1.5rem 1rem;
    padding-top: calc(56px + 64px + 1.5rem); /* Navigation bar (56px) + Toolbar (~64px) + padding */
    background-color: #222831;
  }
  
  .action-container {
    flex: 1;
    display: flex;
    width: 100%;
    transition: all 0.5s;
  }
</style>

