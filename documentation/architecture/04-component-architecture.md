# Component Architecture

## Overview

Lingua follows a component-based architecture using Svelte 5 with traditional reactivity patterns. Components are organized by responsibility, following Single Responsibility Principle (SRP) and composition over inheritance.

## Component Hierarchy

```
App.svelte (Root)
│
├─ NavBar.svelte (Global Navigation)
│
└─ Router (svelte-spa-router)
    │
    ├─ Home.svelte (Study Page)
    |   |─ ToolBar.svelte
    │   ├─ Parsing.svelte
    │   │   └─ FlashcardSettings.svelte
    │

```

## Component Categories

### 1. Page Components

**Location**: `/src/pages/`

Top-level route components that orchestrate business logic and layout.

#### Home.svelte

**Purpose**: Study interface with mode picker

```svelte
<script>
  import Flashcard from '../lib/components/home/Flashcard.svelte'
  import ActionBar from '../lib/components/home/ActionBar.svelte'

  let showSettings = false
</script>

<section class="container centered">
  <Flashcard bind:showSettings />
  <ActionBar on:openSettings={() => (showSettings = true)} />
</section>
```

**Responsibilities:**

- Layout study interface
- Manage settings panel state
- Coordinate flashcard and action bar

#### Create.svelte

**Purpose**: Flashcard creation and import

**Responsibilities:**

- Manage flashcard creation form
- Handle CSV import
- Tag management interface
- Success/error feedback

#### Lexicon.svelte

**Purpose**: Flashcard library and management

```svelte
<script>
  import { flashcardsStore } from '../lib/stores/flashcardsStore.js'
  import { tagsStore } from '../lib/stores/tagsStore.js'
  import { foldersStore } from '../lib/stores/foldersStore.js'
  import { derived, writable } from 'svelte/store'
  import FlashcardTableView from '../lib/components/lexicon/FlashcardTableView.svelte'
  import EditFlashcardModal from '../lib/components/lexicon/EditFlashcardModal.svelte'
  
  let viewMode = 'table' // 'list' or 'table' (table is default)
  const searchQuery = writable('')
  let showEditModal = false
  let editingCard = null
  
  // Derived store for filtered/sorted cards
  const cardsSorted = derived([flashcardsStore, tagsStore, foldersStore, searchQuery], ...)
</script>
```

**Responsibilities:**

- Display flashcard collection with multiple view modes:
  - List view (compact text-based display)
  - Gallery view (card-based display with size options: small, medium, large)
  - Graph view (force-directed visualization - optional)
- Search functionality across vocabulary, translation, tags, and folders
- Modal-based editing via EditFlashcardModal
- Delete operations with confirmation
- View mode toggle with localStorage persistence
- Gallery card size preference persistence
- Folder management integration

#### Login.svelte

**Purpose**: User authentication

**Responsibilities:**

- Email/password login
- OAuth providers
- Magic link
- Phone number verification
- Password reset

#### Profile.svelte

**Purpose**: User settings and preferences

**Responsibilities:**

- Display user profile
- Manage preferences
- View statistics
- Account management

### 2. Feature Components

**Location**: `/src/lib/components/` (organized by page)

Reusable components with specific functionality, organized into page-specific folders for better maintainability and discoverability.

#### Organization Structure

```
/src/lib/components/
├── analytics/          # Analytics & visualization components
│   ├── GraphView.svelte
│   └── StudyAnalytics.svelte
├── create/             # Content creation components
│   ├── FlashcardCreationForm.svelte
│   ├── FolderManager.svelte
│   ├── ImportPanel.svelte
│   └── TagManager.svelte
├── home/               # Study interface components
│   ├── ActionBar.svelte
│   ├── Flashcard.svelte
│   └── FlashcardSettings.svelte
├── lexicon/            # Library management components
│   ├── AdvancedSearch.svelte
│   ├── BulkActionsToolbar.svelte
│   ├── EditFlashcardModal.svelte
│   ├── FilterMenu.svelte
│   ├── FlashcardTableView.svelte
│   └── VirtualScrollList.svelte
├── login/              # Authentication components
│   └── SignupForm.svelte
└── shared/             # Cross-page shared components
    ├── Counter.svelte
    ├── KeyboardShortcutsHelp.svelte
    ├── LoadingSpinner.svelte
    ├── NavBar.svelte
    ├── OfflineIndicator.svelte
    ├── PWAInstallPrompt.svelte
    ├── SkeletonScreen.svelte
    └── Toast.svelte
```

#### Component Import Examples

```svelte
<!-- Analytics page components -->
import StudyAnalytics from '../lib/components/analytics/StudyAnalytics.svelte' import GraphView from
'../lib/components/analytics/GraphView.svelte'

<!-- Create modal components (within Lexicon page) -->
import FlashcardCreationForm from '../lib/components/create/FlashcardCreationForm.svelte' import ImportPanel
from '../lib/components/create/ImportPanel.svelte'

<!-- Shared components (used across multiple pages) -->
import LoadingSpinner from '../lib/components/shared/LoadingSpinner.svelte' import NavBar from '../lib/components/shared/NavBar.svelte'
```

#### Flashcard.svelte

**Location**: `/src/lib/components/home/Flashcard.svelte`
**Purpose**: Interactive flashcard display with study tracking

```svelte
<script>
  import { updateReviewStats } from './db/reviews.js'

  let isFlipped = false
  let currentCard = null

  async function markCorrect() {
    await updateReviewStats(currentCard.id, currentCard, true)
    await next()
  }
</script>

<div class="flashcard" class:flipped={isFlipped}>
  <div class="face front">{currentCard.front}</div>
  <div class="face back">{currentCard.back}</div>
</div>

{#if isFlipped}
  <button on:click={markCorrect}>✓ Correct</button>
  <button on:click={markIncorrect}>✕ Incorrect</button>
{:else}
  <button on:click={flip}>flip</button>
{/if}
```

**Key Features:**

- 3D flip animation
- Review recording
- Auto-advance to next card
- Filter by tags
- Shuffle functionality

#### FlashcardTableView.svelte

**Location**: `/src/lib/components/lexicon/FlashcardTableView.svelte`
**Purpose**: Tabular display of flashcard collection with metrics

**Props:**

```javascript
{
  cards: Array<Object>,        // Flashcard data
  tagsById: Object,             // Tag lookup map
  foldersById: Object,          // Folder lookup map
  onEdit: Function,             // Edit callback (opens modal)
  onDelete: Function            // Delete callback
}
```

**Features:**

- Sortable columns (vocabulary, translation, tags, folder, date, reviews, success rate, mastery)
- Click to edit (triggers modal)
- Folder display with color coding
- Success rate color coding
- Mastery level badges
- Responsive (hides on mobile)
- Accessibility (ARIA labels, keyboard navigation)

#### EditFlashcardModal.svelte

**Location**: `/src/lib/components/lexicon/EditFlashcardModal.svelte`
**Purpose**: Unified modal for editing flashcards

**Props:**

```javascript
{
  show: Boolean,               // Modal visibility
  card: Object,                // Flashcard to edit
  onClose: Function            // Close callback
}
```

**Features:**

- Edit term and translation
- Tag selection with search
- Folder assignment with radio buttons
- Visual tag indicators (selected state)
- Auto-focus on open
- Keyboard navigation (Enter to save, Escape to close)
- Click outside to close

#### FlashcardCreationForm.svelte

**Location**: `/src/lib/components/create/FlashcardCreationForm.svelte`
**Purpose**: Form for creating new flashcards

**Features:**

- Target vocabulary input
- Native translation input
- Tag selection with autocomplete
- Recently used tags
- Tab completion for tags
- Form validation

#### TagManager.svelte

**Location**: `/src/lib/components/create/TagManager.svelte`
**Purpose**: Create and manage tags

**Features:**

- Create new tags
- Edit tag names and colors
- Delete tags
- Color picker
- Tag usage statistics

#### GraphView.svelte

**Location**: `/src/lib/components/analytics/GraphView.svelte`
**Purpose**: Interactive force-directed graph visualization of vocabulary relationships

**Props:**

```javascript
{
  flashcards: Array,           // Flashcard data to visualize
  tags: Array,                 // Tag data for connections
  folders: Array,              // Folder data for connections
  onNodeClick: Function        // Callback when node is clicked
}
```

**Features:**

- D3.js force simulation for natural node positioning
- Interactive controls (zoom, pan, drag nodes)
- Node coloring by mastery level (blue=new, orange=learning, green=mastered)
- Connection types:
  - Shared tag connections (flashcards with common tags)
  - Shared folder connections (flashcards in same folder)
  - Optional tag nodes and folder nodes
- Toggle controls for link types and node visibility
- Hover highlighting of connected nodes
- Click nodes to trigger edit callback
- Visual legend for mastery levels
- Responsive sizing

**Technical Details:**

- Uses D3.js force simulation with link, charge, center, and collision forces
- SVG-based rendering
- Zoom behavior with scale limits (0.1x - 4x)
- Node size calculation based on mastery level and review count
- Link distance varies by connection type
- Performance: Optimal for <100 nodes, acceptable up to 500 nodes

### 3. Utility Components

#### NavBar.svelte

**Location**: `/src/lib/components/shared/NavBar.svelte`
**Purpose**: Global navigation

```svelte
<script>
  import { userStore } from '../../stores/authStore.js'
  export let onNavigate = path => {}
</script>

<nav class="nav container">
  <div class="nav__brand">
    <a href="#/" on:click|preventDefault={() => onNavigate('/')}> FLIP </a>
  </div>
  <div class="nav__actions">
    <button on:click={() => onNavigate('/login')}>login</button>
    <!-- Create functionality moved to Lexicon modal -->
    <button on:click={() => onNavigate('/lexicon')}>lexicon</button>
    <button on:click={() => onNavigate('/profile')}>
      {#if $userStore?.photoURL}
        <img src={$userStore.photoURL} alt="Profile" />
      {:else}
        my profile
      {/if}
    </button>
  </div>
</nav>
```

**Fixed Position**: Sticks to top of viewport

#### SearchMenu.svelte

**Purpose**: Search interface for filtering flashcards

**Events:**

- `search` - Emits search query

#### FilterMenu.svelte

**Purpose**: Tag-based filtering interface

**Features:**

- Tag multi-select
- Match ALL vs ANY toggle
- Sort order selection

## Component Communication Patterns

### 1. Props Down

**Parent → Child data flow**

```svelte
<!-- Parent -->
<FlashcardTableView
  cards={$cardsSorted}
  tagsById={$tagsById}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### 2. Events Up

**Child → Parent communication**

```svelte
<!-- Child emits event -->
<script>
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  function handleSearch() {
    dispatch('search', { query: searchValue })
  }
</script>

<!-- Parent listens -->
<SearchMenu on:search={e => searchQuery.set(e.detail.query)} />
```

### 3. Stores (Global State)

**Shared state across components**

```svelte
<!-- Component A -->
<script>
  import { flashcardsStore } from './stores/flashcardsStore.js'
</script>
Total: {$flashcardsStore.length}

<!-- Component B (different file) -->
<script>
  import { flashcardsStore } from './stores/flashcardsStore.js'
</script>
{#each $flashcardsStore as card}
  <!-- Renders same data -->
{/each}
```

### 4. Callbacks

**Parent provides functions to child**

```svelte
<!-- Parent -->
<script>
  function handleEdit(card) {
    // Edit logic
  }
</script>

<FlashcardTableView onEdit={handleEdit} />

<!-- Child -->
<script>
  export let onEdit = null

  function startEdit(card) {
    if (onEdit) onEdit(card)
  }
</script>
```

## Styling Architecture

### Global Styles

**Location**: `/src/app.css`

```css
:root {
  --color-bg: #3c3a3e;
  --color-section: #435446;
  --color-text-primary: #f0e4e4;
  --color-text-secondary: #999999;
  --color-button-bg: #9ab0a2;
  --color-button-text: #3c3a3e;
  --color-button-hover: #8a9584;
}

/* Global resets and utilities */
* {
  box-sizing: border-box;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}
.centered {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Component-Scoped Styles

Each Svelte component has its own `<style>` block (scoped by default):

```svelte
<style>
  /* Scoped to this component only */
  .flashcard {
    background: var(--color-section);
    border-radius: 16px;
    /* ... */
  }
</style>
```

### Design Tokens (CSS Variables)

Consistent use of CSS variables for theming:

```css
/* Instead of hardcoded colors */
background: #435446; /* ❌ Bad */

/* Use CSS variables */
background: var(--color-section); /* ✅ Good */
```

## State Management Patterns

### Local State

**Component-specific state**

```svelte
<script>
  let isFlipped = false // Local to this component
  let currentIndex = 0 // Not shared
  let editingId = null // Component-only
</script>
```

### Reactive Declarations

**Computed values that auto-update**

```svelte
<script>
  let count = 0

  // Recomputes when count changes
  $: doubled = count * 2

  // Reactive statement
  $: if (count > 10) {
    console.log('Count is high!')
  }

  // Reactive block
  $: {
    console.log(`Count changed to ${count}`)
  }
</script>
```

### Derived Stores

**Computed stores from other stores**

```svelte
<script>
  import { derived } from 'svelte/store'
  import { flashcardsStore } from './stores/flashcardsStore.js'

  const dueCards = derived(flashcardsStore, $cards => $cards.filter(c => isDueForReview(c)))
</script>

Due today: {$dueCards.length}
```

## Accessibility Patterns

### Semantic HTML

```svelte
<!-- Use semantic elements -->
<nav>...</nav>
<main>...</main>
<section>...</section>
<article>...</article>

<!-- Not generic divs -->
<div class="nav">...</div>
<!-- ❌ -->
```

### ARIA Labels

```svelte
<button aria-label="Edit {card.targetVocabulary}" title="Edit">
  <svg aria-hidden="true">...</svg>
</button>

<table>
  <caption class="sr-only">
    Flashcard collection with {cards.length} cards
  </caption>
  ...
</table>
```

### Keyboard Navigation

```svelte
<th
  on:click={() => handleSort('createdAt')}
  on:keydown={e => e.key === 'Enter' && handleSort('createdAt')}
  tabindex="0"
  aria-sort={sortDirection}
>
  Date Created
</th>
```

### Screen Reader Announcements

```svelte
<div aria-live="polite" aria-atomic="true" class="sr-only">
  {#if sortAnnouncement}
    {sortAnnouncement}
  {/if}
</div>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
  }
</style>
```

## Responsive Design Patterns

### Mobile-First CSS

```css
/* Base styles for mobile */
.flashcard-table {
  display: none; /* Hide table on mobile */
}

/* Desktop styles */
@media (min-width: 768px) {
  .flashcard-table {
    display: table;
  }

  .mobile-list {
    display: none;
  }
}
```

### Conditional Rendering

```svelte
<script>
  import { onMount } from 'svelte'

  let isMobile = false

  onMount(() => {
    isMobile = window.innerWidth < 768

    window.addEventListener('resize', () => {
      isMobile = window.innerWidth < 768
    })
  })
</script>

{#if isMobile}
  <FlashcardList cards={$cards} />
{:else}
  <FlashcardTableView cards={$cards} />
{/if}
```

## Component Lifecycle

### Svelte Lifecycle Hooks

```svelte
<script>
  import { onMount, onDestroy, beforeUpdate, afterUpdate } from 'svelte'

  // Runs after component is first rendered
  onMount(() => {
    console.log('Component mounted')

    // Cleanup function
    return () => {
      console.log('Component will unmount')
    }
  })

  // Runs before component updates
  beforeUpdate(() => {
    console.log('About to update')
  })

  // Runs after component updates
  afterUpdate(() => {
    console.log('Component updated')
  })

  // Runs when component is destroyed
  onDestroy(() => {
    console.log('Component destroyed')
  })
</script>
```

### Store Subscriptions

```svelte
<script>
  import { flashcardsStore } from './stores/flashcardsStore.js'
  import { onDestroy } from 'svelte'

  // Manual subscription (auto-cleanup with onDestroy)
  const unsubscribe = flashcardsStore.subscribe(cards => {
    console.log('Cards updated:', cards.length)
  })

  onDestroy(unsubscribe)

  // OR: Auto-subscribe with $ (Svelte handles cleanup)
  $: cardsCount = $flashcardsStore.length
</script>
```

## Performance Optimization

### Keyed Each Blocks

```svelte
<!-- Always use key for dynamic lists -->
{#each cards as card (card.id)}
  <CardRow {card} />
{/each}

<!-- Not: -->
{#each cards as card}
  <!-- ❌ No key -->
  <CardRow {card} />
{/each}
```

### Lazy Loading

```svelte
<script>
  import { onMount } from 'svelte'

  let HeavyComponent

  onMount(async () => {
    const module = await import('./HeavyComponent.svelte')
    HeavyComponent = module.default
  })
</script>

{#if HeavyComponent}
  <svelte:component this={HeavyComponent} />
{/if}
```

### Debouncing Input

```svelte
<script>
  let searchQuery = ''
  let debouncedQuery = ''
  let timeout

  function handleInput(e) {
    clearTimeout(timeout)
    searchQuery = e.target.value

    timeout = setTimeout(() => {
      debouncedQuery = searchQuery
    }, 300)
  }
</script>

<input on:input={handleInput} />

<!-- Search with debouncedQuery -->
```

## Testing Patterns

### Component Testing (Manual)

**Test Checklist for New Components:**

- [ ] Props work correctly
- [ ] Events emit as expected
- [ ] Local state updates properly
- [ ] Reactive declarations recompute
- [ ] Store subscriptions work
- [ ] Lifecycle hooks fire correctly
- [ ] Accessibility (ARIA, keyboard nav)
- [ ] Responsive design
- [ ] Error states handled
- [ ] Edge cases covered

### Integration Testing

**Test Component Integration:**

```svelte
<!-- Test parent-child communication -->
<Parent>
  <Child on:event={handleEvent} />
</Parent>

<!-- Test store integration -->
<ComponentA />
<!-- Updates store -->
<ComponentB />
<!-- Reads from same store -->
```

## Utility Modules

### Graph Builder (`/src/lib/utils/analytics/graphBuilder.js`)

**Purpose**: Transform flashcard data into graph structures for D3.js visualization

**Exports:**

```javascript
// Build graph data from flashcards, tags, and folders
buildGraphData(flashcards, tags, folders, options)
  Returns: { nodes: Array, links: Array }

// Get color for a node based on type and properties
getNodeColor(node)
  Returns: string (hex color)

// Get stroke color for a link based on type
getLinkColor(link)
  Returns: string (hex color)
```

**Node Types:**

- `flashcard` - Individual vocabulary cards (size based on mastery and review count)
- `tag` - Optional tag nodes for visualization
- `folder` - Optional folder nodes for visualization

**Link Types:**

- `shared-tag` - Connects flashcards with common tags (strength based on shared count)
- `shared-folder` - Connects flashcards in same folder
- `has-tag` - Connects flashcard to tag node (when tag nodes visible)
- `in-folder` - Connects flashcard to folder node (when folder nodes visible)

**Options:**

```javascript
{
  showTagNodes: boolean,          // Show tag nodes in graph
  showFolderNodes: boolean,       // Show folder nodes in graph
  showTagConnections: boolean,    // Connect flashcards with shared tags
  showFolderConnections: boolean  // Connect flashcards in same folder
}
```

**Algorithm Details:**

- Calculates node size: base (8px) + mastery bonus + review count bonus
- Creates pairwise connections for flashcards sharing tags/folders
- Avoids duplicate links (tag connections take precedence over folder)
- Optimizes for performance with O(n²) complexity for connections

## Related Documentation

- [System Overview](./00-system-overview.md)
- [Data Architecture](./01-data-architecture.md)
- [Study & Review System](./03-study-review-system.md)
- [Technology Stack](./05-technology-stack.md)
- [Graph Visualization Implementation Plan](../implementation-plans/graph-visualization.md)

---

**Last Updated**: 2025-10-02  
**Version**: 2.4 (Code Organization & Architecture Improvements)
