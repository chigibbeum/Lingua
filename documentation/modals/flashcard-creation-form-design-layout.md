## Flashcard Creation Form — Design & Layout

This document describes the visual design, layout, and interaction patterns for the Flashcard Creation Form (`web/src/lib/components/create/FlashcardCreationForm.svelte`). It is aligned with the FLIP Project Guidelines.

### Guideline Alignment

- § 3.0 Design System and Layout — color palette, typography, spacing.
- § 3.5 Create Page — two input columns, one row as placeholder, Import and Submit buttons, and a right-side space for Tags.
- § 4.0 Code Review Standards — readable structure, modular responsibilities, accessibility, and consistent styling.
- § 4.4 Architecture Documentation — see `architecture/04-component-architecture.md` (component/page boundaries) and `architecture/01-data-architecture.md` (data entities like tags/decks/cards).

### Purpose and Placement

- Provides the UI to add new flashcards with target and native language fields.
- Supports tagging, part of speech, and optional deck association at creation time.
- Appears on the Create page and can be embedded where card creation is needed.

### Visual Design

- Page and inputs align to § 3.1 color palette:
  - Inputs background: `#31363f` (Section/Div Backgrounds)
  - Labels: `#eeeeee` (Secondary Text)
  - Input text: `#76abae` (Primary Text)
  - Focus ring/border: `#76abae` (Primary Text)
  - Neutral borders: `#31363f` for unobtrusive separation
- Pills for tags/decks use background colors derived from tag/deck data; “new” pills default to `#76abae` with dark text `#222831` (Main Background) for contrast.

### Structure

- Root form `.fc-form` — vertical stack container.
- Grid `.form-grid` — two columns on desktop: left for vocabulary fields; right for metadata (part of speech, tags, decks).
- Rows `.row` — label + control groups for consistent rhythm and spacing.
- Selected lists `.selected-tags` — pill list blocks for selected tags and decks.
- Actions `.actions` — row with Import and Create buttons centered beneath the grid.

### Layout and Responsiveness

- Desktop grid: `grid-template-columns: 1fr 1fr`; `gap: 1rem` for comfortable spacing.
- Breakpoint ≤900px: collapses to a single-column layout for small screens.
- Columns use `.col-content` wrappers to center and stack fields consistently.

### Form Controls

- Target language input (`#target`) and Native language input (`#native`) on the left column; placeholders follow § 3.3/§ 3.5 examples (e.g., “안녕하세요”, “hello”).
- Part of speech select (`#pos`) on the right column with predefined options.
- Tags input (`#tags`):
  - Type to search among available tags
  - Tab: accept the recommended match
  - Enter: if no exact match, create a temporary tag (pill shown as “new”)
  - Recent suggestions are shown with “Suggested” label
- Decks input (`#decks`) mirrors Tags behavior for deck selection/creation.

### Interactions and Shortcuts

- Keyboard:
  - Tab to accept recommended tag/deck
  - Enter to select exact match or create a new temporary tag/deck when there is no match
- Hints:
  - Contextual hint lines (`.hint`) indicate the current recommendation and creation action; `aria-live="polite"` announces hints unobtrusively for AT users.
- Pills:
  - Selected items appear as pills with inline “×” remove buttons.

### Accessibility

- Labeled inputs via `label for` pairing; explicit `aria-label` on the select control.
- Hints use `aria-live="polite"` to announce suggestions.
- Clear focus states via border color, meeting keyboard navigation expectations (§ 4.3 Review Process: accessibility and keyboard navigation).

### Theming and Tokens

- Inputs rely on Design System colors for consistency (`#eeeeee` for secondary/labels, `#76abae` for primary/input text).
- Focus color aligns with § 3.1 Primary Text `#76abae` to provide a cohesive, accessible highlight.

### Actions

- Import (secondary action) — triggers an import workflow (dispatched event), aligned with § 3.5 “import”.
- Create (primary action) — submits the form and persists the card; aligned with § 3.5 “submit”.
- Buttons are centered and spaced for balanced visual weight.

### Data/State (Context for Layout)

- Controlled inputs are bound to local state; selected tags/decks and “new” entities are tracked and displayed as pills.
- Recently used tags/decks are persisted in `localStorage` for quick reuse; suggestions render inline.

### Error/Edge Handling (UI Relevant)

- Avoids duplicate new tag/deck entries by name.
- Disables default form navigation on Enter where creation/selection behavior is intended.

### Integration Notes

- Ensure the page background uses § 3.1 Main Background `#222831` for palette consistency.
- This form focuses on the creation experience; navigation per § 3.2 is provided by the page layout, not by the form.
- Tag and deck colors should remain accessible over pill text; adjust foreground if a custom background is low contrast.

### Future Considerations

- Move button styling fully to shared button components using Design System tokens (Button Background `#31363f`, Button Text `#eeeeee`, Hover `#415780`).
- Add validation messaging (inline and ARIA) for required fields if/when business rules require them.
- Localize labels, placeholders, and all helper text.
