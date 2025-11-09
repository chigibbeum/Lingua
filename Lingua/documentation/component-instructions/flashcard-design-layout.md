## Flashcard Component — Design & Layout

This document describes the visual design, layout, and interaction patterns for the Flashcard component (`web/src/lib/components/home/Flashcard.svelte`). It is aligned with the FLIP Project Guidelines.

### Guideline Alignment
- § 3.0 Design System and Layout — uses the project color palette and sizes; implements § 3.4 Flashcard Component requirements (flip motion, front/back text, three controls beneath).
- § 4.0 Code Review Standards — consistent structure, readable styles, accessibility considerations, no unnecessary complexity.
- § 4.4 Architecture Documentation — see `04-component-architecture.md` for component/page boundaries and `03-study-review-system.md` for review interactions context.

### Purpose and Placement
- The flashcard is the primary learning surface and is centered within its container.
- It displays target language text on the front and native translation on the back.
- It appears on the Home page and any study context where a single card view is required.

### Visual Design
- Card background: theme token `var(--color-section)` (mapped in the theme to § 3.1 color `#31363f`).
- Text color on the card faces: `#76abae` (Design System Primary Text; meets § 3.4 requirement for card text).
- Card radius: 16px; backdrop radius: 18px to create a subtle outer band.
- Backdrop: an inset (-2px on each side) darker layer behind the card for depth without shadow, using the Main Background `#222831` for subtle contrast.
- Typography: scalable, responsive font size — 2rem desktop, 1.5rem ≤768px, 1.25rem ≤480px.

### Structure
- Wrapper (`.flashcard-wrap`): centers content, provides vertical rhythm, and hosts loading/empty states.
- Frame (`.flashcard-frame`): fixed aspect area with 3D perspective for flipping.
- Card (`.flashcard`): a 3D container that rotates around the Y axis.
- Faces (`.face.front` and `.face.back`): absolutely positioned, backface-hidden panels representing front/back content.
- Controls (`.controls`): three-button row beneath the card; switches to a two-button centered layout in review mode.

### Layout and Sizing
- Desktop frame: max-width 420px, height 260px.
- ≤768px: max-width 350px, height 220px.
- ≤480px: max-width 300px, height 200px.
- Controls width matches frame at each breakpoint to maintain a consistent column.
- `.controls` has `min-height: 56px` to prevent layout shifts when toggling modes.

### Interactions
- Flip: smooth rotateY transition (cubic-bezier timing); prefers-reduced-motion lowers transition duration.
- Swipe: horizontal swipe navigates (left/right > 50px threshold), vertical swipe flips; single-touch only.
- Keyboard: Space flips; ArrowRight advances; ArrowLeft goes back (when available). Role and tabindex enable keyboard focus and activation.
- Click/Tap: the card is a `role="button"` with `aria-label` to announce usage to assistive tech.

### States and Modes
- Loading: shows a centered spinner within the frame.
- Empty: shows a message encouraging users to create or adjust filters.
- Study: default state with three controls beneath — flip, next, shuffle.
- Review: when flipped, shows two semantic action buttons — Correct and Incorrect — centered using a 4-column grid template. A hidden placeholder preserves grid height when needed.

### Controls
- Default controls (not flipped):
  - Flip — toggles the card
  - Next — advances to the next card (wraps via modulo)
  - Shuffle — Fisher–Yates shuffle of the current deck, resets index
- Review mode (flipped):
  - Correct — optimistic review record, advances immediately
  - Incorrect — optimistic review record, advances immediately
- Disabled states prevent double-submission and reflect empty decks.

### Color and Theming
- Card surfaces: `var(--color-section)` for compliance with § 3.1 Main Section/Div Backgrounds (`#31363f`).
- Card text: `#76abae` per § 3.1 Primary Text.
- Non-review control buttons: background `#31363f`, text `#eeeeee`, hover `#415780` per § 3.1.
- Review buttons use semantic green/red gradients to convey correctness. These may later be adapted to a design-token-based semantic scale if required by Design System updates.

### Accessibility
- Interactive card exposes `role="button"`, keyboard focus via `tabindex="0"`, and an explanatory `aria-label`.
- Motion sensitivity respected via `@media (prefers-reduced-motion: reduce)`.
- Button labels are explicit and keyboard-friendly; disabled states communicate availability.

### Responsiveness
- Breakpoints at 768px and 480px adjust frame size, font sizes, and control spacing.
- Controls switch to a column layout at ≤480px for better touch targets and readability.

### Anti-Shift Measures
- `.controls` reserves vertical space to avoid layout jump when switching between three-button (study) and two-button (review) configurations.
- A hidden placeholder button in review mode can be used to keep equal slot sizing without visible content.

### Data/State (Context for Layout)
- The layout is reactive to deck length and flipped state. It hides review controls unless the card is flipped.
- Tag/deck/folder filters influence which cards appear; when filters change, the index resets and the card is unflipped.

### Integration Notes
- The component relies on global CSS variables (e.g., `--color-section`) for palette compliance.
- Ensure the page hosting this component uses the site-wide background `#222831` (§ 3.1) so the card/controls contrast properly.
- Navigation elements (§ 3.2) live outside this component and should consistently frame the page where the card sits centered (§ 3.3).

### Future Considerations
- Align review button colors with Design System tokens, introducing semantic success/error tokens if needed.
- Centralize button styles so the non-review controls (`flip`, `next`, `shuffle`) reflect the standard button styling defined by § 3.1.
- Add localization for labels and ARIA strings.


