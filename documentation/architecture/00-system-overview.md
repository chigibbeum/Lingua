# System Overview

**LINGUA** - Minimal Flashcards Application

## Purpose

LINGUA is a web-based flashcard application designed for language learners to create, organize, and study vocabulary efficiently. The system emphasizes simplicity while incorporating intelligent spaced repetition for optimized learning.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│                     (Svelte 5 + Vite)                       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   UI Pages   │  │  Components  │  │    Stores    │      │
│  │              │  │              │  │              │      │
│  │ • Landing    │  │ • Flashcard  │  │ • Auth       │      │
│  │ • Home       │  │ • Table View │  │ • Flashcards │      │
│  │ • Create     │  │ • Forms      │  │ • Tags       │      │
│  │ • Lexicon    │  │ • NavBar     │  │ • Settings   │      │
│  │ • Login      │  │ • Analytics  │  │              │      │
│  │ • Profile    │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │            Business Logic Layer                     │     │
│  │                                                      │     │
│  │  • Authentication Handlers                          │     │
│  │  • CRUD Operations (Flashcards, Tags)               │     │
│  │  • Review & SRS Algorithm (SM-2)                    │     │
│  │  • Import/Export Utilities                          │     │
│  │  • Sorting & Filtering Logic                        │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Firebase Services                        │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Firebase   │  │  Firestore   │  │   Firebase   │      │
│  │     Auth     │  │   Database   │  │  Analytics   │      │
│  │              │  │              │  │              │      │
│  │ • Email/Pwd  │  │ • Flashcards │  │ • User       │      │
│  │ • OAuth      │  │ • Tags       │  │   Events     │      │
│  │ • Magic Link │  │ • Users      │  │              │      │
│  │ • Phone      │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Core Systems

### 1. **Authentication System**

- Multi-method authentication (email/password, OAuth, magic links, phone)
- Session persistence management
- User profile management
- See: `02-authentication-system.md`

### 2. **Data Management System**

- Real-time Firestore synchronization
- Reactive Svelte stores for state management
- Optimistic UI updates
- See: `01-data-architecture.md`

### 3. **Flashcard Management System**

- CRUD operations for flashcards
- Tag-based organization
- Search and filtering
- Import/Export (CSV)
- See: `01-data-architecture.md`

### 4. **Study & Review System**

- SM-2 spaced repetition algorithm
- Review tracking and statistics
- Mastery level progression
- Performance analytics
- See: `03-study-review-system.md`

### 5. **UI Component System**

- Reusable Svelte components
- Multiple view modes (list, gallery, graph visualization)
- Responsive design (mobile-first)
- Accessibility support (ARIA, keyboard navigation)
- Interactive data visualizations (D3.js)
- See: `04-component-architecture.md`

## Key Design Principles

### 1. **Simplicity First**

- Clean, minimal interface
- Focus on core functionality
- No feature bloat
- Fast, responsive UX

### 2. **Real-Time Synchronization**

- All data syncs in real-time via Firestore
- Reactive stores update UI automatically
- No manual refresh needed

### 3. **Offline-Ready**

- Firebase local persistence
- Optimistic UI updates
- Graceful error handling

### 4. **Modular Architecture**

- Single Responsibility Principle (SRP)
- DRY (Don't Repeat Yourself)
- Clear component boundaries
- Reusable utilities

### 5. **Accessibility**

- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Screen reader support

## Data Flow Overview

```
User Action
    │
    ▼
UI Component (Svelte)
    │
    ▼
Event Handler / Business Logic
    │
    ▼
Store Update (Optimistic)
    │
    ▼
Firebase API Call
    │
    ▼
Firestore Database
    │
    ▼
Real-time Listener (onSnapshot)
    │
    ▼
Store Update (Confirmed)
    │
    ▼
UI Re-render (Reactive)
```

## File Structure

```
Lingua/
├── src/
│   ├── app.css                    # Global styles (imported by +layout)
│   ├── app.html                   # Root HTML template
│   ├── lib/                       # Domain + UI code
│   │   ├── components/
│   │   │   ├── create/            # Flashcard creation helpers
│   │   │   ├── layout/            # Navigation bar + toolbar
│   │   │   ├── modes/             # ParseMode + FlashcardMode shells
│   │   │   ├── modals/            # Sentence/Deck/Settings/Note modals
│   │   │   ├── parse/             # Action panes embedded in ParseMode
│   │   │   ├── ui/                # Low-level primitives (checkbox, select…)
│   │   │   └── views/             # Landing/Home/Login/Profile views
│   │   ├── icons/                 # Svelte icon components (see §4.5.1)
│   │   ├── schemas/               # Zod/TS schemas for domain objects
│   │   ├── services/              # Firebase-facing data services
│   │   ├── stores/                # Smart stores (auth, router, session…)
│   │   └── utils.ts               # Shared helpers
│   ├── routes/
│   │   ├── +layout.svelte         # Root shell (imports CSS + Firebase)
│   │   └── +page.svelte           # Single routed page that renders views
│   └── shims/…                    # Type shims
├── documentation/                 # Architecture + guidelines (this folder)
├── package.json
├── svelte.config.js
├── tsconfig.json
└── vite.config.ts
```

## Technology Stack

### Frontend

- **Framework**: Svelte 5 (traditional reactivity)
- **Build Tool**: Vite 7
- **Routing**: svelte-spa-router
- **Visualization**: D3.js 7 (force simulation, zoom, drag)
- **Language**: JavaScript (with JSDoc types)

### Backend/Services

- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Analytics**: Firebase Analytics
- **Hosting**: Firebase Hosting

### Development

- **Version Control**: Git
- **Package Manager**: npm
- **CI/CD**: GitHub Actions + Firebase

See: `05-technology-stack.md` for detailed information

## Security Model

### Authentication

- Multi-factor authentication support
- Session persistence options (local/session storage)
- OAuth provider integration (Google, GitHub, Apple)

### Data Access

- User-scoped data isolation (userId filtering)
- Firestore security rules enforce access control
- All queries filtered by authenticated user ID

### Client-Side

- Input sanitization (XSS prevention)
- HTTPS-only communication
- No sensitive data in localStorage

## Performance Characteristics

### Initial Load

- Vite optimized bundling
- Code splitting by route
- Lazy loading of components

### Runtime

- Real-time updates via Firestore listeners
- Efficient reactive updates (Svelte)
- Optimistic UI for perceived performance

### Scalability

- Serverless architecture (Firebase)
- Auto-scaling database (Firestore)
- CDN distribution (Firebase Hosting)

## Deployment Architecture

```
Developer
    │
    ▼
Git Push to main
    │
    ▼
GitHub Actions Workflow
    │
    ├─→ npm run build (Vite)
    │
    └─→ firebase deploy
            │
            ├─→ Firebase Hosting (Static Assets)
            │
            └─→ Firestore Rules Deployment
                    │
                    ▼
                Production Environment
                    │
                    ▼
                End Users
```

## Future Architecture Considerations

### Potential Enhancements

1. **Cloud Functions** - Server-side processing for complex operations
2. **Firestore Extensions** - Pre-built functionality (e.g., Algolia search)
3. **Progressive Web App (PWA)** - Offline support, installability
4. **Background Sync** - Queue operations when offline
5. **Multi-language Support** - i18n/l10n framework

### Scalability Plans

- Implement data pagination for large collections
- Add virtual scrolling for table view
- Consider CDN for user-uploaded content
- Implement caching strategies for frequently accessed data

## Related Documentation

- [Data Architecture](./01-data-architecture.md)
- [Authentication System](./02-authentication-system.md)
- [Study & Review System](./03-study-review-system.md)
- [Component Architecture](./04-component-architecture.md)
- [Technology Stack](./05-technology-stack.md)

---

**Last Updated**: 2025-10-02  
**Version**: 2.4 (Code Organization & Architecture Improvements)
