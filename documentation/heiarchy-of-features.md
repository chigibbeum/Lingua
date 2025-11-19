Lists out everything this app an do:
`Home.svelte` (choose a mode)
Two Modes:
1: Parsing Mode (`Parse.svelte`) - `Toolbar.svelte` - 6 Actions: - Add (New) Text Action (`SentenceCreateAction.svelte`) - Visible cursor - No surrounding box or background - 'insert text' prompt - check submit icon - Parse Text Action (`ParseTextAction.Svelte`) - Single click popover appears: - Break node command - Add note command - Popover adjusts: - top section - text box appears - part of speech tagging - bottom section: - check icon for submitting - Submit via "enter" or clicking the check mark

- Double click pop over appears: - Add note command - Popover appears: - top section
  -text box appears - part of speech tagging - bottom section: - check icon for submitting - Submit via "enter" or clicking the check mark
- Edit Text Action (`EditTextAction.svelte`) - Popover appears: - Top half: text box - Bottom half: insert left command, edit command, insert right command
  Submit via enter button or selecting a command - Create Flashcard Action - `CreateFlashcardModal.svelte` (User can select vocabulary notes to convert into flashcards) - Save Notes Action - `SaveNotesModal.svelete` (Modal appears in the center of the page where the user can input a title, tag, and add created date. Saved sentences move to `SentenceLibraryModal.svelete`) - View History Action - `SideHistoryView.svelte` (Side panel appears on the right. use can view history and return to a change made)
  2: Flashcard Mode:
