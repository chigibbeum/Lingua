# Architecture Diagrams & Flowcharts

## Overview

This document consolidates all major architectural diagrams for quick reference.

## System Architecture Diagrams

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                           │
│                   (Browser - Svelte App)                     │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │                  UI Layer                           │     │
│  │  Pages: Home | Create | Lexicon | Login | Profile  │     │
│  └────────────────────────────────────────────────────┘     │
│                            │                                  │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Component Layer                        │     │
│  │  Flashcard | Table | Forms | NavBar | Settings     │     │
│  └────────────────────────────────────────────────────┘     │
│                            │                                  │
│  ┌────────────────────────────────────────────────────┐     │
│  │              State Management                       │     │
│  │  Stores: Auth | Flashcards | Tags | Settings       │     │
│  └────────────────────────────────────────────────────┘     │
│                            │                                  │
│  ┌────────────────────────────────────────────────────┐     │
│  │            Business Logic Layer                     │     │
│  │  DB Helpers | SRS Algorithm | Import/Export        │     │
│  └────────────────────────────────────────────────────┘     │
│                            │                                  │
│  ┌────────────────────────────────────────────────────┐     │
│  │             Firebase SDK                            │     │
│  │  Auth API | Firestore API | Analytics API          │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────┼───────────────────────────────┘
                               │
                               │ HTTPS
                               │
┌──────────────────────────────┼───────────────────────────────┐
│                        FIREBASE TIER                          │
│                      (Google Cloud)                           │
│                              │                                 │
│  ┌──────────────┐  ┌────────┴────────┐  ┌──────────────┐    │
│  │   Firebase   │  │  Cloud Firestore│  │   Firebase   │    │
│  │     Auth     │  │    (Database)   │  │  Analytics   │    │
│  │              │  │                 │  │              │    │
│  │ • Email/Pwd  │  │ • flashcards    │  │ • Events     │    │
│  │ • OAuth      │  │ • tags          │  │ • User Props │    │
│  │ • Magic Link │  │ • Real-time     │  │ • Funnels    │    │
│  │ • Phone SMS  │  │ • Offline       │  │              │    │
│  └──────────────┘  └─────────────────┘  └──────────────┘    │
│                              │                                 │
│  ┌──────────────────────────┴──────────────────────────┐    │
│  │            Firebase Hosting (CDN)                    │    │
│  │  • Static Assets (HTML, CSS, JS)                     │    │
│  │  • Global Distribution                               │    │
│  │  • SSL/HTTPS                                         │    │
│  └──────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Real-Time Data Synchronization

```
┌────────────────────────────────────────────────────────┐
│                    DEVICE A                             │
│                                                          │
│  User creates flashcard                                 │
│         │                                                │
│         ▼                                                │
│  createFlashcard() called                               │
│         │                                                │
│         ▼                                                │
│  Firestore addDoc()                                     │
└─────────┼──────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│               CLOUD FIRESTORE                            │
│                                                           │
│  Document added to /flashcards collection                │
│         │                                                 │
│         ├──────────────────┬─────────────────────┐      │
└─────────┼──────────────────┼─────────────────────┼──────┘
          ▼                  ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   DEVICE A      │  │   DEVICE B      │  │   DEVICE C      │
│                 │  │                 │  │                 │
│ onSnapshot      │  │ onSnapshot      │  │ onSnapshot      │
│   fires         │  │   fires         │  │   fires         │
│     │           │  │     │           │  │     │           │
│     ▼           │  │     ▼           │  │     ▼           │
│ Store updates   │  │ Store updates   │  │ Store updates   │
│     │           │  │     │           │  │     │           │
│     ▼           │  │     ▼           │  │     ▼           │
│ UI re-renders   │  │ UI re-renders   │  │ UI re-renders   │
│ (shows new card)│  │ (shows new card)│  │ (shows new card)│
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Study & Review Flow

```
┌─────────────┐
│  HOME PAGE  │
│             │
│  Flashcard  │
│  Component  │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Show front side  │
│ (target vocab)   │
└──────┬───────────┘
       │
       │ User tries to recall
       ▼
┌──────────────────┐
│ User clicks FLIP │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Show back side   │
│ (translation)    │
└──────┬───────────┘
       │
       ▼
┌──────────────────────────────┐
│ Controls change:             │
│ ┌─────────┐  ┌──────────┐  │
│ │✓ Correct│  │✕ Wrong   │  │
│ └─────────┘  └──────────┘  │
└──────┬───────────┬───────────┘
       │           │
       │           │
       ▼           ▼
  ┌─────────┐  ┌─────────┐
  │ Correct │  │  Wrong  │
  └────┬────┘  └────┬────┘
       │            │
       ├────────────┤
       ▼
┌───────────────────────────────────┐
│   recordAndNext(wasCorrect)       │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ calculateReviewUpdate()           │
│                                    │
│ • Run SM-2 algorithm              │
│ • Update statistics               │
│ • Calculate next review date      │
│ • Determine mastery level         │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ updateDoc(flashcardId, stats)     │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ Firestore triggers onSnapshot     │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ flashcardsStore updates           │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ Table view shows updated metrics  │
│ • Review count increased          │
│ • Success rate recalculated       │
│ • Mastery badge may change        │
└───────────────────────────────────┘
```

### Authentication Flow

```
┌──────────────┐
│  Login Page  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────┐
│   User selects auth method:      │
│                                   │
│   ┌──────┐ ┌────┐ ┌──────────┐  │
│   │Email │ │OAuth│ │Magic Link│  │
│   └──┬───┘ └─┬──┘ └────┬─────┘  │
└──────┼───────┼─────────┼─────────┘
       │       │         │
       └───────┴─────────┘
               │
               ▼
┌──────────────────────────────────┐
│   Firebase Auth API              │
│   • Validate credentials         │
│   • Create/verify session        │
│   • Generate auth token          │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│   onAuthStateChanged fires       │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│   userStore.set(user)            │
└──────────────┬───────────────────┘
               │
               ├─→ userId derived store updates
               │
               ├─→ isLoggedIn derived store updates
               │
               └─→ flashcardsStore subscribes to user's data
                           │
                           └─→ tagsStore subscribes to user's data
                                       │
                                       ▼
                           ┌───────────────────────┐
                           │  UI updates:          │
                           │  • Show user profile  │
                           │  • Display flashcards │
                           │  • Redirect to home   │
                           └───────────────────────┘
```

## Store Architecture Diagram

### Store Dependency Graph

```
┌─────────────────────────────────────────────────────┐
│                   userStore                          │
│                 (writable store)                     │
│                                                       │
│  Updated by: onAuthStateChanged(auth, set)          │
└─────────┬──────────────────┬────────────────────────┘
          │                  │
          ▼                  ▼
┌─────────────────┐  ┌────────────────┐
│    userId       │  │  isLoggedIn    │
│  (derived)      │  │  (derived)     │
└─────────┬───────┘  └────────────────┘
          │
          │
          ▼
┌─────────────────────────────────────────────────────┐
│               flashcardsStore                        │
│                (readable store)                      │
│                                                       │
│  • Subscribes to userId changes                     │
│  • Creates Firestore listener when userId present   │
│  • Tears down listener when userId null             │
│  • Updates on every Firestore change                │
└─────────┬───────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│          Derived Stores (in components)              │
│                                                       │
│  • cardsSorted (filtered + sorted)                  │
│  • dueCards (filtered by nextReviewAt)              │
│  • masteredCards (filtered by masteryLevel)         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                  tagsStore                           │
│                (readable store)                      │
│                                                       │
│  • Subscribes to userId changes                     │
│  • Creates Firestore listener for user's tags       │
│  • Updates on tag create/update/delete              │
└─────────┬───────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│          Derived Stores (in components)              │
│                                                       │
│  • tagsById (map for quick lookup)                  │
│  • tagUsageCounts (cards per tag)                   │
│  • featuredTags (most used tags)                    │
└─────────────────────────────────────────────────────┘
```

## Component Communication Diagram

```
┌─────────────────────────────────────────────────────┐
│                 Lexicon.svelte                       │
│                 (Page Component)                     │
│                                                       │
│  State:                                              │
│  • viewMode: 'list' | 'table'                       │
│  • searchQuery: writable('')                        │
│  • cardsSorted: derived(...)                        │
│                                                       │
│  Handlers:                                           │
│  • handleTableEdit(card)                            │
│  • handleTableDelete(card)                          │
│  • toggleView()                                      │
└─────────┬──────────────────┬────────────────────────┘
          │                  │
          │ Props Down       │ Props Down
          ▼                  ▼
┌──────────────────┐  ┌─────────────────────────┐
│ FlashcardList    │  │ FlashcardTableView      │
│                  │  │                         │
│ Props:           │  │ Props:                  │
│ • cards          │  │ • cards                 │
│ • tagsById       │  │ • tagsById              │
│                  │  │ • onEdit (callback)     │
│ Events:          │  │ • onDelete (callback)   │
│ • edit (up)      │  │                         │
│ • delete (up)    │  │ Internal State:         │
│                  │  │ • sortColumn            │
│                  │  │ • sortDirection         │
│                  │  │ • editingId             │
└──────────────────┘  └─────────────────────────┘
```

## Database Schema Diagram

```
┌──────────────────────────────────────────────────────────┐
│                     FIRESTORE DATABASE                    │
└──────────────────────────────────────────────────────────┘

┌─────────────────────────┐
│   flashcards (collection)│
├─────────────────────────┤
│ Document ID: auto        │
│ ┌───────────────────┐   │
│ │ userId: string    │───┼─→ [Indexed] Query by user
│ │ targetVocabulary  │   │
│ │ nativeTranslation │   │
│ │ tagIds: [...]     │───┼─→ References to tags
│ │ createdAt         │───┼─→ [Indexed] Sorting
│ │ updatedAt         │   │
│ │                   │   │
│ │ Review Fields:    │   │
│ │ • lastReviewedAt  │   │
│ │ • nextReviewAt    │───┼─→ [Indexed] Due date queries
│ │ • reviewCount     │   │
│ │ • successCount    │   │
│ │ • failCount       │   │
│ │ • streak          │   │
│ │ • currentInterval │   │
│ │ • easeFactor      │   │
│ │ • masteryLevel    │───┼─→ [Indexed] Filter by mastery
│ └───────────────────┘   │
└─────────────────────────┘

┌─────────────────────────┐
│     tags (collection)    │
├─────────────────────────┤
│ Document ID: auto        │
│ ┌───────────────────┐   │
│ │ userId: string    │───┼─→ [Indexed] Query by user
│ │ name: string      │───┼─→ [Indexed] Tag lookup
│ │ color: string     │   │
│ │ createdAt         │   │
│ │ updatedAt         │   │
│ └───────────────────┘   │
└─────────────────────────┘

┌─────────────────────────┐
│  users (future planned)  │
├─────────────────────────┤
│ Document ID: userId      │
│ ┌───────────────────┐   │
│ │ displayName       │   │
│ │ email             │   │
│ │ photoURL          │   │
│ │ preferences {}    │   │
│ │ stats {}          │   │
│ └───────────────────┘   │
└─────────────────────────┘
```

## SM-2 Algorithm Flowchart

```
┌─────────────────────────┐
│  User reviews flashcard │
│  Marks correct/incorrect│
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Get current card state:        │
│  • currentInterval (days)       │
│  • easeFactor                   │
│  • reviewCount                  │
│  • successCount                 │
│  • failCount                    │
│  • streak                       │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Map answer to quality:         │
│  • Correct → quality = 4        │
│  • Incorrect → quality = 1      │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Calculate new ease factor:     │
│  EF = EF + (0.1 - (5-Q) *       │
│       (0.08 + (5-Q) * 0.02))    │
│  EF = max(1.3, EF)              │
└────────────┬────────────────────┘
             │
             ▼
     ┌───────┴────────┐
     │                │
     ▼                ▼
┌─────────┐    ┌──────────────┐
│Quality<3│    │  Quality≥3   │
│(Wrong)  │    │  (Correct)   │
└────┬────┘    └──────┬───────┘
     │                │
     ▼                ▼
┌─────────┐    ┌──────────────────────┐
│Interval │    │ Calculate interval:   │
│  = 1    │    │ • 1st: 1 day         │
│         │    │ • 2nd: 6 days        │
│         │    │ • 3rd+: I × EF       │
└────┬────┘    └──────┬───────────────┘
     │                │
     └────────┬───────┘
              │
              ▼
┌──────────────────────────────────┐
│  Update statistics:               │
│  • reviewCount++                 │
│  • successCount++ (if correct)   │
│  • failCount++ (if wrong)        │
│  • streak++ or reset to 0        │
│  • lastReviewedAt = now          │
│  • nextReviewAt = now + interval │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Determine mastery level:        │
│  • New: reviewCount = 0          │
│  • Learning: in progress         │
│  • Mastered: 85%+ success,       │
│    21+ days, 5+ streak           │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Write to Firestore              │
│  updateDoc(cardId, allUpdates)   │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Auto-advance to next card       │
└──────────────────────────────────┘
```

## Component Lifecycle Diagram

```
Component Creation
        │
        ▼
┌─────────────────┐
│  <script> runs  │
│  (once)         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  onMount()      │
│  (after render) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Component      │
│  rendered       │
└────────┬────────┘
         │
         ▼
    ┌────┴────┐
    │ Updates │ (reactive)
    └────┬────┘
         │
    ┌────▼────────────────┐
    │  beforeUpdate()     │
    │  (before DOM update)│
    └────┬────────────────┘
         │
         ▼
    ┌────────────────────┐
    │  DOM updated        │
    └────┬────────────────┘
         │
         ▼
    ┌────────────────────┐
    │  afterUpdate()      │
    │  (after DOM update) │
    └────┬────────────────┘
         │
         │ (loop on changes)
         │
         ▼
┌─────────────────┐
│  onDestroy()    │
│  (cleanup)      │
└────────┬────────┘
         │
         ▼
Component Destroyed
```

## Firestore Data Flow

```
CLIENT (Svelte App)
    │
    ├─→ Write Operation (Create/Update/Delete)
    │       │
    │       ▼
    │   ┌────────────────────────────┐
    │   │ Optimistic Update          │
    │   │ (update store immediately) │
    │   └────────────────────────────┘
    │       │
    │       ▼
    │   Firebase SDK → FIRESTORE
    │                      │
    │                      ├─→ Security Rules Check
    │                      │       │
    │                      │       ├─→ PASS: Write succeeds
    │                      │       │
    │                      │       └─→ FAIL: Error returned
    │                      │
    │                      └─→ Triggers onSnapshot
    │                              │
    │   ┌──────────────────────────┘
    │   │
    └─→ Read Operation (Real-time Listener)
        │
        ▼
    onSnapshot(query, (snapshot) => {
      const data = snapshot.docs.map(...)
      store.set(data)
    })
        │
        ▼
    Store Updates
        │
        ▼
    UI Re-renders (Reactive)
```

## Build & Deployment Pipeline

```
┌─────────────────────┐
│  Developer          │
│  • Edit code        │
│  • Git commit       │
│  • Git push         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│  GitHub Repository (main)       │
└──────────┬──────────────────────┘
           │
           │ Triggers
           ▼
┌─────────────────────────────────┐
│  GitHub Actions Workflow        │
│                                  │
│  1. Checkout code               │
│  2. Setup Node.js               │
│  3. npm ci (clean install)      │
│  4. npm run build (Vite)        │
│     │                            │
│     ├─→ Compile Svelte → JS     │
│     ├─→ Bundle dependencies     │
│     ├─→ Optimize assets         │
│     ├─→ Generate source maps    │
│     └─→ Output to dist/         │
│                                  │
│  5. firebase deploy              │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Firebase Hosting               │
│  (Global CDN)                   │
│                                  │
│  • Distribute to edge servers   │
│  • Serve with HTTPS             │
│  • Cache static assets          │
│  • Handle SPA routing           │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Production Live                │
│  Users access app globally      │
└─────────────────────────────────┘
```

## Import/Export Data Flow

### CSV Import Flow

```
User selects CSV file
        │
        ▼
┌──────────────────────┐
│  File read as text   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────┐
│  parseCSV(text)              │
│  • Handle quoted fields      │
│  • Detect header row         │
│  • Parse into row objects    │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Extract unique tag names    │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  For each tag:               │
│  • Query Firestore for tag   │
│  • If exists: get ID         │
│  • If not: create tag        │
│  • Cache ID for batch write  │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Batch write flashcards:     │
│  • Map tags to IDs           │
│  • Add review fields         │
│  • writeBatch.set()          │
│  • batch.commit()            │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Firestore onSnapshot fires  │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  flashcardsStore updates     │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  UI shows imported cards     │
│  Show success message        │
└──────────────────────────────┘
```

## View Mode Toggle Flow

```
User in Lexicon page (list view)
        │
        ▼
User clicks table icon
        │
        ▼
┌──────────────────────────────┐
│  toggleView() called         │
│  • viewMode = 'table'        │
│  • Save to localStorage      │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Svelte reactivity:          │
│  {#if viewMode === 'table'}  │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  FlashcardTableView renders  │
│  • Same cards data           │
│  • Different UI              │
│  • Sortable columns          │
│  • Review metrics visible    │
└──────────────────────────────┘

Next Session:
        │
        ▼
User returns to Lexicon
        │
        ▼
┌──────────────────────────────┐
│  onMount() reads localStorage│
│  • viewMode = 'table'        │
└──────────┬───────────────────┘
           │
           ▼
Table view shown automatically
```

## Responsive Design Breakpoints

```
┌────────────────────────────────────────────────────────┐
│                    VIEWPORT WIDTHS                      │
└────────────────────────────────────────────────────────┘

0px                                                     ∞
├────────────────────┼──────────────────────────────────▶
       Mobile              Tablet           Desktop
     (<768px)          (768-1024px)        (>1024px)

Mobile Layout:
├─────────────┤
│   NavBar    │
├─────────────┤
│             │
│  Flashcard  │
│    (full)   │
│             │
├─────────────┤
│   List      │
│   View      │
│   (Table    │
│   Hidden)   │
└─────────────┘

Tablet/Desktop Layout:
├────────────────────────────────────┤
│           NavBar                    │
├────────────────────────────────────┤
│                                     │
│  ┌──────────────┐  ┌────────────┐ │
│  │              │  │   Action   │ │
│  │  Flashcard   │  │    Bar     │ │
│  │              │  │            │ │
│  └──────────────┘  └────────────┘ │
│                                     │
│  ┌──────────────────────────────┐ │
│  │      Table View              │ │
│  │   (Full width, scrollable)   │ │
│  └──────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Related Documentation

- [System Overview](./00-system-overview.md)
- [Data Architecture](./01-data-architecture.md)
- [Authentication System](./02-authentication-system.md)
- [Study & Review System](./03-study-review-system.md)
- [Component Architecture](./04-component-architecture.md)
- [Technology Stack](./05-technology-stack.md)

---

**Last Updated**: 2025-09-30  
**Version**: 2.0
