# Technology Stack

## Overview

LINGUA is built with modern web technologies focused on developer experience, performance, and scalability. The stack emphasizes real-time capabilities, serverless architecture, and rapid development.

## Frontend Stack

### Core Framework

#### Svelte 5.39.4

**Why Svelte:**

- ✅ True reactivity (no virtual DOM)
- ✅ Minimal runtime overhead
- ✅ Excellent performance
- ✅ Simple, intuitive syntax
- ✅ Built-in state management
- ✅ Scoped CSS by default
- ✅ Small bundle sizes

**Reactivity Pattern:**

```javascript
// Traditional reactivity (not using runes)
let count = 0

// Auto-reactive declaration
$: doubled = count * 2

// Reactive statement
$: if (count > 10) {
  console.log('High count!')
}
```

**Component Example:**

```svelte
<script>
  let name = 'World'

  $: greeting = `Hello, ${name}!`
</script>

<input bind:value={name} />
<p>{greeting}</p>

<style>
  p {
    color: var(--color-text-primary);
  }
</style>
```

**Version Notes:**

- Using Svelte 5 with traditional reactivity
- NOT using runes yet (simpler migration from Svelte 4)
- Scoped styles for component isolation

### Build Tool

#### Vite 7.1.7

**Why Vite:**

- ✅ Lightning-fast HMR (Hot Module Replacement)
- ✅ Optimized production builds
- ✅ Native ES modules in dev
- ✅ Automatic code splitting
- ✅ Built-in TypeScript support
- ✅ Plugin ecosystem

**Configuration:**

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
})
```

**Development:**

- Instant server start
- Sub-50ms HMR updates
- Optimized dependency pre-bundling

**Production:**

- Tree-shaking
- Minification
- Code splitting
- Asset optimization

### Routing

#### SvelteKit File-Based Router

**Why SvelteKit routing:**

- ✅ Nested layouts keep global chrome (`+layout.svelte`) separate from feature views.
- ✅ Built-in data loading (`+page.ts`, `+page.server.ts`) composes cleanly with the domain stores.
- ✅ Progressive enhancement (anchors first, `goto` for SPA-like transitions) with zero hash routing.
- ✅ Out-of-the-box adapter compatibility (Firebase Hosting via `adapter-static` in this repo).

**Layout & page structure:**

```
src/routes/
├── +layout.svelte   # imports app.css, XYFlow styles, Firebase init
└── +page.svelte     # subscribes to router/auth stores and renders the correct view
```

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css'
  import '@xyflow/svelte/dist/style.css'
  import '../lib/firebase/client'
</script>

{@render children()}
```

```ts
// src/routes/+page.ts
import { redirect } from '@sveltejs/kit'
import { base } from '$app/paths'

export const load = () => {
  throw redirect(307, `${base}/landing`)
}
```

**Navigation patterns:**

```svelte
<script lang="ts">
  import { goto } from '$app/navigation'
  import { base } from '$app/paths'

  export function handleNavigate(route: 'parse' | 'flashcard') {
    goto(`${base}/${route === 'parse' ? 'parse' : 'flashcard'}`)
  }
</script>
```

- UI surfaces stay accessible by using semantic `<a>` or `<button>` elements, but the actual view swap is handled by filesystem routes via `goto` (see `Home.svelte` and the toolbar handlers).
- When we introduce additional filesystem routes (e.g., `/profile`), continue to trigger navigation with `$app/navigation` while leaving static `<a href="/profile">Profile</a>` links for progressive enhancement.

**Data loading hooks:**

- Use `src/routes/+page.ts` when the view needs preload data or to redirect before the component renders.
- Server-only data belongs in `+page.server.ts` so secrets never reach the browser.
- `load` functions can read from Svelte stores or Firebase SDKs and pass the results to the component via props.
- `(protected)/+layout.server.ts` exposes any cookie/session hints to authenticated routes (future home for Firebase Admin verification).
- `(protected)/home/+page.ts` snapshots `DashboardSnapshot` (active mode, totals, recent history, prefs) so `Home.svelte` can render stats instantly.
- `(protected)/parse/+page.ts` (client-side loader, `ssr = false`) grabs the current `sessionStore` value, recent parse history, and saved sentences via `sentenceService`.
- `(protected)/flashcard/+page.ts` (client-side loader) preloads `listFlashcards()` and the latest flashcard history so `FlashcardMode` can render without a second fetch.
- `src/routes/api/session/+server.ts` works with Firebase Admin to issue HTTP-only session cookies so server loaders can trust `event.locals.user`.

### Data Visualization

#### D3.js 7.x

**Why D3.js:**

- ✅ Industry-standard visualization library
- ✅ Powerful force simulation for graph layouts
- ✅ Flexible and customizable
- ✅ Excellent documentation and examples
- ✅ Rich interaction capabilities (zoom, pan, drag)
- ✅ Modular architecture (import only needed modules)

**Used For:**

- Force-directed graph visualization of vocabulary relationships
- Interactive node manipulation (drag, zoom, pan)
- Dynamic data visualization updates

**Modules Used:**

```javascript
import * as d3 from 'd3'

// Core modules in use:
// - d3-selection: DOM manipulation
// - d3-force: Force simulation
// - d3-zoom: Zoom and pan behavior
// - d3-drag: Drag interactions
```

**Example Usage:**

```javascript
const simulation = d3
  .forceSimulation()
  .force(
    'link',
    d3.forceLink().id(d => d.id)
  )
  .force('charge', d3.forceManyBody().strength(-300))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force(
    'collision',
    d3.forceCollide().radius(d => d.size + 5)
  )
```

**Performance Considerations:**

- SVG-based rendering (optimal for <500 nodes)
- Canvas rendering available for larger datasets
- Force simulation can be tuned for performance vs. aesthetics

### Language

#### JavaScript (ES2022)

**Why JavaScript (not TypeScript):**

- ✅ Faster development iteration
- ✅ No build step for types
- ✅ JSDoc for type hints when needed
- ✅ Simpler tooling
- ✅ Lower barrier to entry

**JSDoc Type Hints:**

```javascript
/**
 * @type {Array<{id: string, name: string}>}
 */
export let cards = []

/**
 * @param {string} cardId
 * @param {boolean} wasCorrect
 * @returns {Promise<void>}
 */
export async function updateReviewStats(cardId, wasCorrect) {
  // ...
}
```

**Modern Features Used:**

- Optional chaining (`?.`)
- Nullish coalescing (`??`)
- Array methods (map, filter, reduce)
- Async/await
- Destructuring
- Spread operator
- Template literals

## Backend / Services Stack

### Backend as a Service

#### Firebase 12.3.0

**Services Used:**

##### 1. Firebase Authentication

**Features:**

- Multi-provider auth (email, OAuth, phone, magic link)
- Session management
- Token refresh
- Security rules integration

**Methods:**

```javascript
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

const auth = getAuth()
await signInWithEmailAndPassword(auth, email, password)
```

##### 2. Cloud Firestore

**Features:**

- Real-time database
- Document-based NoSQL
- Offline persistence
- Automatic synchronization
- Security rules

**Usage:**

```javascript
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore'

const db = getFirestore()

// Real-time listener
onSnapshot(query(collection(db, 'flashcards'), where('userId', '==', uid)), snapshot => {
  const cards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  set(cards)
})
```

**Data Structure:**

- Collections: `flashcards`, `tags`
- Documents: JSON-like objects
- Subcollections: Not used yet
- Indexes: Automatic and composite

##### 3. Firebase Hosting

**Features:**

- Global CDN
- Automatic SSL
- Custom domain support
- Rollback capability
- Preview channels

**Deployment:**

```bash
npm run build
firebase deploy --only hosting
```

**Configuration:**

```json
// firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

##### 4. Firebase Analytics

**Features:**

- User behavior tracking
- Event logging
- Custom parameters
- Audience segmentation

**Usage:**

```javascript
import { getAnalytics, logEvent } from 'firebase/analytics'

const analytics = getAnalytics()
logEvent(analytics, 'flashcard_created', {
  tag_count: 3,
  has_translation: true,
})
```

**Future Services:**

- **Cloud Functions**: Server-side logic (data aggregation, scheduled tasks)
- **Firebase Storage**: User-uploaded images/audio
- **Cloud Messaging**: Push notifications for due reviews

## Development Tools

### Package Management

#### npm

**Why npm:**

- ✅ Industry standard
- ✅ Largest package registry
- ✅ Built into Node.js
- ✅ Lock file for reproducibility

**Key Scripts:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Version Control

#### Git + GitHub

**Workflow:**

- Feature branches
- Pull requests for review
- GitHub Actions for CI/CD
- Protected main branch

**CI/CD Pipeline:**

```yaml
# .github/workflows/firebase-hosting.yml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [main]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm ci && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
```

### Code Quality

#### ESLint (Implicit via Vite)

**Configuration:**

- Svelte plugin for linting
- Modern JavaScript rules
- Accessibility checks

**Future:**

- Prettier for formatting
- Husky for pre-commit hooks
- Commitlint for commit messages

## State Management

### Svelte Stores

**Built-in store types:**

#### Writable Stores

```javascript
import { writable } from 'svelte/store'

export const userStore = writable(null)

// Usage
userStore.set(newUser)
userStore.update(user => ({ ...user, name: 'New Name' }))
```

#### Readable Stores

```javascript
import { readable } from 'svelte/store'

export const flashcardsStore = readable([], set => {
  // Real-time listener
  const unsubscribe = onSnapshot(query, snapshot => {
    set(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
  })

  return unsubscribe // Cleanup
})
```

#### Derived Stores

```javascript
import { derived } from 'svelte/store'

export const dueCards = derived(flashcardsStore, $cards => $cards.filter(c => isDueForReview(c)))
```

#### Store Subscriptions

```svelte
<script>
  import { flashcardsStore } from './stores/flashcardsStore.js'

  // Auto-subscribe (auto-cleanup)
  $: cardsCount = $flashcardsStore.length
</script>

<p>Total cards: {$flashcardsStore.length}</p>
```

## Styling

### CSS

**Approach: Vanilla CSS with CSS Variables**

**Why not a CSS framework:**

- ✅ Full control over styles
- ✅ No unused CSS bloat
- ✅ Scoped styles in components
- ✅ Custom design system
- ✅ Smaller bundle size

**Design System:**

```css
:root {
  /* Colors */
  --color-bg: #3c3a3e;
  --color-section: #435446;
  --color-text-primary: #f0e4e4;
  --color-text-secondary: #999999;
  --color-button-bg: #9ab0a2;
  --color-button-text: #3c3a3e;
  --color-button-hover: #8a9584;

  /* Success rates */
  --rate-excellent: #10b981;
  --rate-good: #f59e0b;
  --rate-fair: #f97316;
  --rate-poor: #ef4444;
}
```

**Component Styles:**

```svelte
<style>
  /* Scoped to component */
  .card {
    background: var(--color-section);
    border-radius: 12px;
    padding: 1rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .card {
      padding: 0.5rem;
    }
  }
</style>
```

## Database

### Cloud Firestore

**Document Database (NoSQL)**

**Advantages:**

- ✅ Real-time synchronization
- ✅ Offline support
- ✅ Flexible schema
- ✅ Automatic scaling
- ✅ Strong security rules
- ✅ No server management

**Data Model:**

- Document-based (JSON-like)
- Collections of documents
- Subcollections supported
- Rich querying (where, orderBy, limit)

**Query Example:**

```javascript
// Get user's flashcards sorted by creation date
const q = query(
  collection(db, 'flashcards'),
  where('userId', '==', currentUserId),
  orderBy('createdAt', 'desc'),
  limit(100)
)

const snapshot = await getDocs(q)
const cards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
```

**Indexes:**

- Single-field indexes (automatic)
- Composite indexes (configured)
- Array-contains support

## Deployment Architecture

### Hosting

#### Firebase Hosting

**Features:**

- Global CDN (180+ edge locations)
- HTTP/2 support
- Brotli compression
- Custom domains
- SSL certificates (automatic)

**Performance:**

- Fast global delivery
- Asset caching
- Optimized routing
- 99.95% uptime SLA

### Build Pipeline

```
Developer
    ↓
Git Push to main
    ↓
GitHub Actions Trigger
    ↓
npm ci (clean install)
    ↓
npm run build (Vite)
    ↓
Firebase Deploy
    ↓
Production (Live)
```

**Build Output:**

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [component]-[hash].js
└── vite.svg
```

## Performance Characteristics

### Bundle Size

**Production Build:**

- Main bundle: ~50-80 KB (gzipped)
- Vendor bundle: ~150-200 KB (gzipped)
- Total initial load: ~200-280 KB (gzipped)

**Code Splitting:**

- Route-based splitting
- Lazy loading for large components
- Dynamic imports for heavy features

### Runtime Performance

**Svelte Benefits:**

- No virtual DOM overhead
- Compiled to vanilla JavaScript
- Small runtime (~3KB)
- Reactive updates are O(1)

**Firebase Performance:**

- Real-time updates: <100ms latency
- Offline reads: instant (from cache)
- Writes: optimistic + background sync

### Lighthouse Scores (Target)

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

## Security

### Client-Side Security

1. **XSS Prevention**: Input sanitization
2. **HTTPS Only**: Enforced by Firebase Hosting
3. **No Sensitive Data**: Never store credentials client-side
4. **Content Security Policy**: Configured headers

### Backend Security

1. **Firebase Security Rules**: User-scoped data access
2. **Authentication Required**: All operations require auth
3. **Rate Limiting**: Firebase automatic protection
4. **Input Validation**: Server-side (Firebase rules)

**Example Security Rules:**

```javascript
// Firestore Security Rules (conceptual)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /flashcards/{cardId} {
      allow read, write: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## Dependencies

### Production Dependencies

```json
{
  "dependencies": {
    "d3": "^7.9.0",
    "firebase": "12.3.0",
    "svelte": "^5.39.4",
    "svelte-spa-router": "4.0.1"
  }
}
```

### Development Dependencies

```json
{
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^6.2.0",
    "firebase-tools": "^14.17.0",
    "vite": "^7.1.7"
  }
}
```

**Total Dependencies: 4 production + 3 dev**

**Why minimal dependencies:**

- ✅ Faster installs
- ✅ Smaller bundle sizes
- ✅ Fewer security vulnerabilities
- ✅ Easier maintenance
- ✅ Better performance

**Note on D3.js:**

- While D3.js is a larger library (~300KB unminified), it's only loaded when needed
- Tree-shaking reduces bundle size to only used modules
- Graph visualization is opt-in feature (lazy loading possible)

## Browser Support

### Target Browsers

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

### Required Features

- ES2020+ support
- CSS Grid
- Flexbox
- CSS Variables
- Local Storage
- Fetch API
- Promises/Async-await

### Polyfills

Not needed for modern browsers (target audience)

## Future Technology Considerations

### Potential Additions

1. **TypeScript**: Full type safety
2. **Vitest**: Unit testing framework
3. **Playwright**: E2E testing
4. **PWA Support**: Offline functionality, installability
5. **Workbox**: Service worker management
6. **Tailwind CSS**: Utility-first CSS (if design system grows)
7. **Cloud Functions**: Server-side processing
8. **Firebase Extensions**: Pre-built functionality

### Migration Paths

**To TypeScript:**

- Gradual migration (file-by-file)
- Keep .js files, add .ts gradually
- No rewrite needed

**To Svelte Runes:**

- When ready for Svelte 5 runes
- Migration guide available
- Incremental adoption possible

**To SvelteKit:**

- If SSR/SSG needed
- File-based routing
- Server-side capabilities

## Development Environment

### Required Tools

1. **Node.js**: v18+ (LTS recommended)
2. **npm**: v9+
3. **Git**: v2.30+
4. **Modern Browser**: Chrome/Firefox/Safari
5. **Code Editor**: VS Code recommended

### VS Code Extensions (Recommended)

- Svelte for VS Code
- ESLint
- Prettier
- Firebase
- GitLens
- Path Intellisense

### Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Firebase
firebase deploy
```

## Related Documentation

- [System Overview](./00-system-overview.md)
- [Data Architecture](./01-data-architecture.md)
- [Authentication System](./02-authentication-system.md)
- [Study & Review System](./03-study-review-system.md)
- [Component Architecture](./04-component-architecture.md)

---

**Last Updated**: 2025-10-01  
**Version**: 2.1 (Graph Visualization & D3.js Integration)
