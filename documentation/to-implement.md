## Option B — Smart Tag-Based Decks (Implementation Plan)

This document describes how to implement **Option B (smart/tag-based decks)** on top of the current Option A wiring, in a way that stays aligned with:

- **§ 2.0 Project Overview** — simple, tag- and deck-based organization for language study.
- **§ 1.1 Parsing Mode / § 1.2 Flashcard Mode** — vocab/grammar notes, parts of speech, and tag filters.
- **§ 3.0 Design System and Layout** — color palette and layout remain unchanged; only behavior and light UI controls are added.
- **§ 4.0 Code Review Standards** and **architecture/01-data-architecture.md** — smart-store-style flows, clear boundaries between components and services.

### 1. Concept: What Option B Adds Beyond Option A

Option A (already implemented) ensures:

- Tags are captured on **vocab notes** in parsing mode.
- Tags are persisted on **sentence notes** and propagated into **flashcards**.
- The **Deck Library** builds tag-based "decks" by inspecting `Flashcard.tags`.

Option B builds on this by introducing **“smart decks”**:

- A **deck** can be defined by **rules**, most importantly: “include all cards with tag X (or tags X,Y,…)”.
- These smart decks are **not** manually curated lists; they are **views** that stay in sync as new cards with matching tags are created.
- Users can still have **manual decks** later, but Option B focuses on **tag rule-based decks** first.

In short: **tags become the single source of truth**, and decks become named, reusable **saved filters** over the flashcard collection.

### 2. Data Model Changes

#### 2.1 Deck Documents

Introduce a user-scoped `decks` subcollection under each user:

- Collection path: `users/{uid}/decks`

Proposed shape:

```ts
// Firestore document: DeckDoc
{
  id: string;                    // Firestore document ID
  ownerUid: string;              // user id
  name: string;                  // user-visible name, e.g. "Food", "JLPT N4 Nouns"
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Smart deck rules (Phase 1)
  // Cards are included if they match ANY of the tags (OR-logic).
  tagRules: string[];            // tag names, e.g. ["food", "restaurant"]

  // Future extension: more rule dimensions
  // posRules?: string[];        // optional part-of-speech constraints
  // sentenceTagRules?: string[]; // if sessions gain their own tags
}
```

This aligns with the **Data Architecture** docs (tag-based organization) but keeps the first iteration simple: **one rule family (tags)**, client-side filtering.

#### 2.2 Client Types and Services

Add a `Deck` type and a `deckService`:

```ts
// src/lib/services/deckService.ts
export type Deck = {
  id: string;
  name: string;
  tagRules: string[];
  createdAt: string;
  updatedAt: string;
};

export async function listDecks(): Promise<Deck[]>;
export async function createDeck(input: { name: string; tagRules: string[] }): Promise<string>;
export async function updateDeck(id: string, changes: Partial<{ name: string; tagRules: string[] }>): Promise<void>;
export async function deleteDeck(id: string): Promise<void>;
```

These functions follow the same pattern as existing `sentenceService` and `flashcardService` modules, keeping business logic encapsulated in services (per **§ 4.4 Architecture Documentation** / Smart Store principles).

### 3. Deck Library UI Changes

#### 3.1 Split Views: Scopes, Tags, and Decks

Currently, `DeckLibraryModal.svelte` builds a **single list** that mixes:

- Global scopes: `All`, `Vocab`, `Grammar`
- Tag-derived entries from `Flashcard.tags`

Option B should:

1. Keep the **global scopes** as-is.
2. Treat tag entries as **derived views** (read-only).
3. Add a separate **“Decks” view** that shows user-defined smart decks fetched from `deckService`.

Structurally:

- Add a simple 3-way toggle (text tabs or small icon buttons) above the left-hand list:
  - **Scopes** — All / Vocab / Grammar (current behavior).
  - **Tags** — derived from `Flashcard.tags` (current Option A behavior).
  - **Decks** — user-defined smart decks from Firestore.
- This can be implemented as a local `viewMode: 'scope' | 'tag' | 'deck'` state in `DeckLibraryModal.svelte`.

For Deck view:

- Left pane:
  - List of `Deck` documents (`name` as label, counts computed client-side).
- Right pane:
  - Cards that match the deck’s rules (see section 4).

This keeps the UI consistent with **§ 3.0 Design System** (same colors, layout, and typography) and only introduces a small, clear mode toggle.

### 4. How Smart Deck Rules Apply to Cards

#### 4.1 Matching Algorithm (Client-Side)

Given:

- A `Deck` with `tagRules: string[]`.
- The existing `listFlashcards()` function that returns all cards with `Flashcard.tags?: string[]`.

Rule for **Phase 1**:

- A card belongs to a deck if:

```ts
function cardMatchesDeck(card: Flashcard, deck: Deck): boolean {
  if (!deck.tagRules?.length) return false;
  if (!Array.isArray(card.tags) || card.tags.length === 0) return false;
  const cardTags = card.tags.map(t => t.trim().toLowerCase()).filter(Boolean);
  const rules = deck.tagRules.map(t => t.trim().toLowerCase()).filter(Boolean);
  return rules.some(rule => cardTags.includes(rule));
}
```

Implementation detail:

- When a deck is selected in Deck view, `DeckLibraryModal` should:
  - Reuse `cards: Flashcard[]` already loaded via `listFlashcards()`.
  - Filter to `cards.filter(c => cardMatchesDeck(c, selectedDeck))`.
  - Sort (e.g., newest first, as today).

#### 4.2 Behavior as Cards Change

Because decks are rule-based:

- When new cards are created (from parsing or manual `AddFlashcardModal`), and they have tags matching a deck’s `tagRules`, they **appear automatically** in that deck.
- When tags on a card change (future feature), membership in decks updates automatically on the next `listFlashcards()` call.

This matches the **Smart Store** and **real-time sync** philosophy described in `architecture/01-data-architecture.md`:

- One Firestore listener for flashcards.
- Filter/derive views (decks) **in memory** in derived stores or component-level logic.

### 5. Creating and Editing Decks (UX Flow)

#### 5.1 Creating a Deck

Where:

- In `DeckLibraryModal.svelte`, add a small “Create deck” icon/button in the left header when the **Decks** view is active.

Flow:

1. User clicks “Create deck”.
2. A modal `CreateDeckModal.svelte` opens with:
   - Name input (required).
   - Tag-based rule builder:
     - A text input for tags (reusing the simple pattern from `FlashcardCreationForm`).
     - Tag pills below the input to show selected `tagRules`.
   - Save / Cancel buttons (text buttons are acceptable inside this form, per current modal patterns).
3. On save:
   - Call `deckService.createDeck({ name, tagRules })`.
   - Refresh decks in `DeckLibraryModal` (or optimistically insert).

This reuses patterns from `FlashcardCreationForm` and respects **§ 3.4 Buttons/Icons** (icons in headers/toolbars, simple text buttons within modals are already in use across the app).

#### 5.2 Editing or Deleting a Deck

For each deck entry in the Decks view:

- Add a small inline icon button (e.g., “…” menu or simple edit/delete icons) that opens:
  - `EditDeckModal.svelte` for renaming or adjusting tag rules.
  - A confirmation dialog for deletion.
- Use `deckService.updateDeck` and `deckService.deleteDeck`.

### 6. How Option B Changes the Overall Flow

From the user’s perspective (building on Option A):

1. **Parsing Mode (§ 1.1)**:
   - User adds a vocabulary note and optional **tags** (via `VocabularyNoteModal`).
   - Notes are saved with tags onto the sentence (`SentenceNoteInput` → Firestore).

2. **Creating Flashcards from Notes**:
   - In Parse mode, `CreateFlashcardsModal` lists vocab notes (session + recent).
   - When the user chooses notes and confirms:
     - `createFlashcardsFromVocabNotes` creates new flashcards with `tags` and optional `pos`.

3. **Deck Library — Tag View (Option A)**:
   - Deck Library shows:
     - Scopes (All / Vocab / Grammar).
     - Tag-derived pseudo-decks (`tagName (count)` from `Flashcard.tags`).
   - Selecting a tag entry filters cards with that tag.

4. **Deck Library — Deck View (Option B)**:
   - User switches to “Decks” and creates a named deck, e.g.:
     - Name: `Food`
     - tagRules: `["food", "restaurant"]`
   - Deck `Food` now shows **all cards** with tags `food` or `restaurant`, regardless of **when** or **how** they were created (parsing vs manual).
   - Future cards with those tags automatically appear in `Food`.

5. **Flashcard Mode (§ 1.2)** (future extension using Option B):
   - When Filter actions are implemented, they can:
     - Reference **Decks**: choose a smart deck name (e.g. `Food`) and limit the study queue to cards matching that deck’s rules.
     - Reference **Tags** directly: ad-hoc filters for quick, one-off tag-based study.

### 7. Implementation Order Recommendation

To keep changes incremental and aligned with **§ 4.2 Review Checklist**:

1. **Introduce deck service + types** (`deckService.ts` and `Deck` type).
2. **Wire DeckLibraryModal to deckService**:
   - Add `viewMode` state.
   - Implement Decks view with `listDecks()` and card matching.
3. **Add CreateDeckModal/EditDeckModal**:
   - With minimal UI, reusing the tag-input pattern from `FlashcardCreationForm`.
4. **(Optional Next Step) Integrate Decks into FlashcardMode filters**:
   - Add filter state to FlashcardMode.
   - Allow selecting a deck to restrict the study list.

Throughout, keep to:

- The existing color palette and modal layout from **documentation/design-system.md**.
- The data flow and “smart store” approach described in **architecture/01-data-architecture.md** (single Firestore collection listener, client-side filtering, no duplicated business logic in components).


