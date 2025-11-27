## Option B — Smart Tag-Based Decks

### 1. Concept

Option A (implemented) captures tags on vocab notes and propagates them to flashcards. The Deck Library builds tag-based views by inspecting `Flashcard.tags`.

**Option B** introduces **smart decks**: rule-based views that auto-sync as cards are created.

- Decks are defined by rules (e.g., "include cards with tag X or Y")
- Tags remain the single source of truth
- Decks are named, reusable saved filters over the flashcard collection

### 2. Data Model

#### 2.1 Deck Documents

Collection path: `users/{uid}/decks`

```ts
// DeckDoc
{
  id: string
  ownerUid: string
  name: string                 // e.g. "Food", "JLPT N4 Nouns"
  tagRules: string[]           // OR-logic: ["food", "restaurant"]
  createdAt: Timestamp
  updatedAt: Timestamp
  // Future: posRules?: string[]
}
```

#### 2.2 Service

```ts
// src/lib/services/deckService.ts
export type Deck = {
  id: string
  name: string
  tagRules: string[]
  createdAt: string
  updatedAt: string
}

export async function listDecks(): Promise<Deck[]>
export async function createDeck(input: { name: string; tagRules: string[] }): Promise<string>
export async function updateDeck(id: string, changes: Partial<Deck>): Promise<void>
export async function deleteDeck(id: string): Promise<void>
```

### 3. UI Changes

#### 3.1 DeckLibraryModal Views

Add a 3-way toggle (`viewMode: 'scope' | 'tag' | 'deck'`):

| View       | Content                                  |
| ---------- | ---------------------------------------- |
| **Scopes** | All / Vocab / Grammar (current)          |
| **Tags**   | Derived from `Flashcard.tags` (Option A) |
| **Decks**  | User-defined smart decks from Firestore  |

#### 3.2 Deck View Layout

- **Left pane**: List of `Deck` names with card counts
- **Right pane**: Cards matching the deck's rules

### 4. Card Matching Algorithm

```ts
function cardMatchesDeck(card: Flashcard, deck: Deck): boolean {
  if (!deck.tagRules?.length) return false
  if (!card.tags?.length) return false
  const cardTags = card.tags.map(t => t.trim().toLowerCase())
  const rules = deck.tagRules.map(t => t.trim().toLowerCase())
  return rules.some(rule => cardTags.includes(rule))
}
```

When a deck is selected: `cards.filter(c => cardMatchesDeck(c, selectedDeck))`

Cards auto-appear in matching decks when created with matching tags.

### 5. Creating/Editing Decks

**Create**: Add "Create deck" button in Decks view header → opens `CreateDeckModal.svelte`:

- Name input (required)
- Tag input with pills (reuse pattern from `FlashcardCreationForm`)
- Save/Cancel buttons

**Edit/Delete**: Inline icon on each deck entry → `EditDeckModal.svelte` or confirmation dialog

### 6. Implementation Order

1. Add `deckService.ts` with `Deck` type
2. Wire `DeckLibraryModal` with `viewMode` state and `listDecks()`
3. Add `CreateDeckModal` / `EditDeckModal`
4. (Future) Integrate decks into FlashcardMode filters

---

## Server-Side API Routes (Nice-to-Have)

Optional enhancement: move mutations from client-side Firebase SDK to SvelteKit API routes, using `locals.uid` as ground truth.

### Architecture Comparison

```
CURRENT (Client-Side)                    ENHANCED (Server-Side)
┌────────────┐      ┌───────────┐        ┌────────┐    ┌────────────┐    ┌───────────┐
│ Client     │─────▶│ Firestore │        │ Client │───▶│ API Route  │───▶│ Firestore │
│ (auth.uid) │      └───────────┘        │        │    │ (locals.uid)│    └───────────┘
└────────────┘                           └────────┘    └────────────┘
```

**Why `locals.uid` is safer**: Derived from server-verified session cookie (HTTP-only, verified by Admin SDK in `hooks.server.ts`). Client can't forge it.

### Benefits

| Benefit             | Description                            |
| ------------------- | -------------------------------------- |
| Defense-in-depth    | Server verifies identity before DB ops |
| Rate limiting       | Per-user limits on server              |
| Audit logging       | Server logs all mutations              |
| Atomic transactions | Coordinate multi-doc operations        |

### API Route Structure

```
src/routes/api/
├── sentences/+server.ts       # POST, GET
├── sentences/[id]/+server.ts  # PUT, DELETE
├── notes/+server.ts
├── flashcards/+server.ts
└── decks/+server.ts
```

### Example: Sentences API

```typescript
// src/routes/api/sentences/+server.ts
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.uid) throw error(401, { message: 'Unauthorized' })

  const { text } = await request.json()
  if (!text?.trim()) throw error(400, { message: 'Text required' })

  const docRef = await adminDb!.collection('sentences').add({
    text: text.trim(),
    ownerUid: locals.uid, // Server controls this
    createdAt: Timestamp.now(),
  })

  return json({ id: docRef.id })
}
```

### Client Wrapper

```typescript
export async function saveSentence(text: string): Promise<string> {
  const res = await fetch('/api/sentences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ text }),
  })
  if (!res.ok) throw new Error('Failed to save')
  return (await res.json()).id
}
```

### When to Prioritize

| Scenario                        | Priority |
| ------------------------------- | -------- |
| Basic CRUD with Firestore rules | Low      |
| Rate limiting / audit logging   | Medium   |
| Financial or sensitive data     | High     |

### Migration Strategy

1. Keep client-side services working
2. Add API routes alongside
3. Feature flag to switch modes
4. Migrate entity by entity
5. Update Firestore rules to read-only once migrated

---
