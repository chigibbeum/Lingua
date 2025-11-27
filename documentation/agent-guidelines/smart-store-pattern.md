# The Smart Store Architectural Pattern

Last updated: 2025-11-26

## 1. Overview

The "Smart Store" is the standard architectural pattern for managing state in the Lingua application. This pattern centralizes all logic, data, and related UI state for a given feature into a single, cohesive store, promoting high cohesion and low coupling.

Feature domains in Lingua include:
- **Session Store** (`sessionStore`) — parsing session state, morpheme operations
- **Parse UI Store** (`parseUIStore`) — parsing mode UI state, modals, toolbar
- **Flashcard UI Store** (`flashcardUIStore`) — flashcard mode UI state, filters
- **Auth Store** (`authStore`) — authentication state, user data
- **Router Store** (`routerStore`) — navigation and view state

This document serves as the canonical guideline for this pattern. All new feature development MUST adhere to these principles.

## 2. Core Principles

The Smart Store pattern is defined by three core principles:

### 2.1. Single, Unified State Object

All state for the domain, including both persistent data and transient UI state, MUST be consolidated into a single, top-level state object within the store file.

**Rationale:** This creates an atomic and predictable state container. It leverages Svelte's reactivity system in the most robust way, preventing bugs that can arise from mutating multiple independent state variables.

**Example (Do this):**

```typescript
// src/lib/stores/parseUI.ts

export interface ParseUIState {
  // UI state
  currentAction: ParsingAction
  activeToolbarAction: string | null
  hasUnsavedChanges: boolean
  modals: {
    sentenceLibrary: boolean
    createFlashcards: boolean
    deckLibrary: boolean
    settings: boolean
    history: boolean
  }
}

const initialState: ParseUIState = {
  currentAction: 'add-new',
  activeToolbarAction: 'new-text',
  hasUnsavedChanges: false,
  modals: {
    sentenceLibrary: false,
    createFlashcards: false,
    // ...
  },
}
```

**Anti-Pattern (Do NOT do this):**

```typescript
// AVOID: Multiple, disconnected state variables
let currentAction = writable<ParsingAction>('add-new')
let activeToolbarAction = writable<string | null>(null)
let hasUnsavedChanges = writable(false)
let sentenceLibraryOpen = writable(false)
```

### 2.2. Co-located Logic (Factory Pattern)

All business logic, state mutations, and UI state manipulations for the domain MUST be owned by the store. Use a factory function pattern to create the store with all its methods.

**Rationale:** Keeps a single source of truth for state while allowing separation of concerns and testability. The store remains the façade that exposes the public API; components stay dumb.

**Example:**

```typescript
function createParseUIStore() {
  const { subscribe, update, set } = writable<ParseUIState>(initialState)

  return {
    subscribe,

    setAction(action: ParsingAction) {
      update(state => ({
        ...state,
        currentAction: action,
        activeToolbarAction: action === 'add-new' ? 'new-text' : action,
      }))
    },

    openModal(modal: keyof ParseUIState['modals']) {
      update(state => ({
        ...state,
        modals: { ...state.modals, [modal]: true },
      }))
    },

    reset() {
      set(initialState)
    },
  }
}

export const parseUIStore = createParseUIStore()
```

### 2.3. "Dumb" Components

Svelte components that use a Smart Store MUST remain "dumb." They should not contain complex business logic. Their responsibilities are limited to:

1. Deriving state from the store's subscriptions
2. Displaying that state
3. Calling methods on the store to dispatch actions

**Rationale:** This creates a clear separation of concerns. The component is responsible for the "view," and the store is responsible for the "controller" and "model." This makes components highly reusable and easy to test.

**Example Component:**

```svelte
<script lang="ts">
  import { parseUIStore, currentAction } from '$lib/stores/parseUI'

  // Derive state from store
  $: action = $currentAction

  // Dispatch actions to store
  function handleActionChange(newAction: ParsingAction) {
    parseUIStore.setAction(newAction)
  }
</script>

<button onclick={() => handleActionChange('parse')}>
  Parse Text
</button>
```

## 3. Canonical Examples

### `sessionStore` (Session Management)

The `sessionStore.ts` serves as the primary reference implementation:

- It defines a single `SessionState` object with `mode` and `current` session
- It includes functions for session lifecycle (`startNew`, `beginParse`, `toggleEdit`)
- It delegates morpheme operations to `morphemeService` (maintaining SRP)
- It exposes all state and actions through a single exported `sessionStore` object

### `parseUIStore` (UI State Management)

The `parseUIStore.ts` manages Parse Mode UI:

- Unified state object for actions, toolbar state, and modal visibility
- Methods for `setAction`, `openModal`, `closeModal`, `toggleModal`
- Derived stores for convenient component subscriptions (`currentAction`, `modals`)

## 4. Naming Convention

To ensure clarity and consistency, all store files MUST adhere to the following naming convention:

### 4.1. File Naming

- **camelCase**: The filename MUST use `camelCase`
- **Location**: All stores live under `src/lib/stores/`

### 4.2. Store Categories

#### 1. Feature Stores

- **Purpose**: The primary "Smart Store" for a major, self-contained feature domain
- **Convention**: `<featureName>.ts` or `<featureName>Store.ts`
- **Examples**:
  - `session.ts` — parsing session data and operations
  - `auth.ts` — authentication state and user data

#### 2. UI State Stores

- **Purpose**: Manages the UI state for a specific mode or component group
- **Convention**: `<componentName>UI.ts`
- **Examples**:
  - `parseUI.ts` — Parse Mode UI state, modals, toolbar
  - `flashcardUI.ts` — Flashcard Mode UI state, filters

#### 3. Utility Stores

- **Purpose**: Cross-cutting concerns used by multiple features
- **Convention**: `<concern>.ts`
- **Examples**:
  - `router.ts` — navigation state
  - `settings.ts` — user preferences
  - `history.ts` — action history tracking

## 5. Delegating to Services

For complex business logic, stores should delegate to service modules while maintaining their role as the single state authority.

**Pattern:**

```typescript
// Store calls service for complex logic
const breakMorpheme = (morphemeId: string, breakIndex: number) => {
  update(state => {
    if (!state.current) return state

    // Delegate to service
    const result = breakMorphemeAt(state.current.morphemes, morphemeId, breakIndex)
    if (!result) return state

    // Update state with result
    const { nodes, edges } = morphemesToFlow(result)
    return {
      ...state,
      current: { ...state.current, morphemes: result, nodes, edges },
    }
  })
}
```

## 6. Implementation Mandate

All new and existing stores must adhere to this pattern and naming convention.

## 7. Related Documentation

- `documentation/architecture/01-data-architecture.md` — Firestore schema
- `documentation/architecture/04-component-architecture.md` — Component patterns
- `.cursor/rules/01-code-standards.mdc` — Code review standards

