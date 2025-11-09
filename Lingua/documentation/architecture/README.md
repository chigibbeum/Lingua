# FLIP Architecture Documentation

Welcome to the FLIP architecture documentation. This directory contains comprehensive documentation of the system's architecture, design decisions, and technical implementation.

## 📚 Documentation Index

### [00. System Overview](./00-system-overview.md)
**High-level architecture and system design**

Start here for a bird's-eye view of the entire system. Covers:
- Overall architecture diagram
- Core systems and their relationships
- Design principles
- Data flow patterns
- Technology stack summary
- File structure

**Read this first** if you're new to the codebase.

---

### [01. Data Architecture](./01-data-architecture.md)
**Database schema, stores, and data flow**

Deep dive into how data is structured and managed. Covers:
- Firestore database schema (collections, documents, fields)
- Client-side store architecture (reactive stores)
- Real-time synchronization patterns
- CRUD operations
- Query patterns
- Data migration strategies
- Import/export functionality

**Essential reading** for understanding data flow and state management.

---

### [02. Authentication System](./02-authentication-system.md)
**User authentication and session management**

Complete guide to the authentication system. Covers:
- Multi-method authentication (email, OAuth, magic link, phone)
- Session persistence strategies
- Auth state management (stores)
- Security features
- Error handling
- User profile management
- Integration with the app

**Reference this** when working on login, signup, or user-related features.

---

### [03. Study & Review System](./03-study-review-system.md)
**Spaced repetition algorithm and review tracking**

Detailed explanation of the intelligent study system. Covers:
- SM-2 spaced repetition algorithm
- Review statistics tracking
- Mastery level progression
- Success rate calculation
- Due date management
- Study flow and UX
- Analytics and metrics

**Must-read** for understanding the core learning functionality.

---

### [04. Component Architecture](./04-component-architecture.md)
**UI components, patterns, and best practices**

Guide to the component structure and patterns. Covers:
- Component hierarchy
- Component categories (pages, features, utilities)
- Communication patterns (props, events, stores)
- Styling architecture
- State management patterns
- Accessibility guidelines
- Performance optimization
- Testing strategies

**Consult this** when building or modifying UI components.

---

### [05. Technology Stack](./05-technology-stack.md)
**Technologies, tools, and dependencies**

Comprehensive overview of all technologies used. Covers:
- Frontend stack (Svelte, Vite, Router)
- Backend services (Firebase Auth, Firestore, Hosting)
- Development tools (npm, Git, CI/CD)
- State management (Svelte stores)
- Styling approach (CSS variables)
- Build and deployment pipeline
- Dependencies and rationale
- Browser support

**Reference this** for tooling questions and technology decisions.

---

### [07. Profile & User Management](./07-profile-user-management.md)
**User profile, statistics, and account management**

Complete guide to the profile system. Covers:
- User statistics calculation (cards, reviews, streaks)
- Profile information management (display name, photo)
- Password change functionality
- Account deletion with data cleanup
- Activity timeline tracking
- Toast notification system
- Security and validation patterns

**Essential reading** for profile and account-related features.

---

## 🗺️ Navigation Guide

### New to the Project?

1. Start with **[System Overview](./00-system-overview.md)** for the big picture
2. Read **[Component Architecture](./04-component-architecture.md)** to understand the UI structure
3. Review **[Data Architecture](./01-data-architecture.md)** to learn how data flows
4. Check **[Technology Stack](./05-technology-stack.md)** to understand the tools

### Working on Specific Features?

- **Authentication/Login**: [02. Authentication System](./02-authentication-system.md)
- **Study/Review Flow**: [03. Study & Review System](./03-study-review-system.md)
- **Database/Firestore**: [01. Data Architecture](./01-data-architecture.md)
- **UI Components**: [04. Component Architecture](./04-component-architecture.md)
- **Build/Deploy**: [05. Technology Stack](./05-technology-stack.md)
- **Profile/User Management**: [07. Profile & User Management](./07-profile-user-management.md)

### Need Quick References?

Each document includes:
- Code examples
- Diagrams and flowcharts
- Configuration snippets
- Best practices
- Common patterns
- Testing checklists

## 📊 Architecture Diagrams

### System Layers

```
┌─────────────────────────────────────┐
│         UI Components               │
│    (Svelte Pages & Components)      │
├─────────────────────────────────────┤
│         Business Logic              │
│   (Stores, Helpers, Algorithms)     │
├─────────────────────────────────────┤
│      Firebase SDK Layer             │
│    (Auth, Firestore, Analytics)     │
├─────────────────────────────────────┤
│       Firebase Services             │
│  (Cloud Firestore, Auth, Hosting)   │
└─────────────────────────────────────┘
```

### Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Store Update (Optimistic)
    ↓
Firebase API Call
    ↓
Firestore Database
    ↓
Real-time Listener (onSnapshot)
    ↓
Store Update (Confirmed)
    ↓
UI Re-render (Reactive)
```

## 🎯 Design Principles

1. **Simplicity First**: Focus on core functionality, avoid feature bloat
2. **Real-Time by Default**: Leverage Firestore's real-time capabilities
3. **Modular Architecture**: Clear component boundaries, single responsibility
4. **Accessibility**: ARIA labels, keyboard navigation, screen reader support
5. **Performance**: Optimize for fast load times and smooth interactions
6. **Developer Experience**: Clear code, good documentation, easy debugging

## 🔄 Document Maintenance

### Version History

- **v2.4** (2025-10-02): Code organization & architecture improvements with page-specific component folders
- **v2.3** (2025-10-02): Landing page implementation with smart authentication routing
- **v2.2** (2025-10-01): Graph visualization system with D3.js, gallery view enhancements
- **v2.1** (2025-09-30): Profile & User Management system implementation
- **v2.0** (2025-09-30): Post-Phase 2 implementation (SRS, review tracking, table view)
- **v1.0** (2025-09-15): Initial architecture documentation

### How to Update

When making significant architectural changes:

1. Update the relevant architecture document(s)
2. Update version number and "Last Updated" date
3. Add notes about breaking changes
4. Update diagrams if structure changed
5. Commit with clear message: `docs: update architecture for [feature]`

### Document Ownership

These documents are **living documentation** and should be updated alongside code changes:

- **System changes** → Update System Overview
- **Database schema changes** → Update Data Architecture
- **New auth methods** → Update Authentication System
- **SRS algorithm changes** → Update Study & Review System
- **New components** → Update Component Architecture
- **Dependency changes** → Update Technology Stack

## 🔗 Related Documentation

### Other Documentation Directories

- **`/web/documentation/agent-guidelines/`**: Development standards and code review guidelines
- **`/web/documentation/implementation-plans/`**: Feature implementation plans and reviews

### External Resources

- [Svelte Documentation](https://svelte.dev/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [SM-2 Algorithm](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)

## 📝 Contributing to Documentation

### Writing Guidelines

1. **Be Clear**: Use simple language, explain acronyms
2. **Be Specific**: Include code examples and diagrams
3. **Be Current**: Update docs when code changes
4. **Be Helpful**: Think about what readers need to know

### Formatting Standards

- Use Markdown headings for structure
- Include code blocks with language tags
- Add diagrams using ASCII art or Mermaid
- Keep line length reasonable (80-100 chars)
- Use consistent heading styles

### Review Process

Architecture documentation should be reviewed alongside code changes:

1. Code review includes doc review
2. Major changes require doc updates
3. Breaking changes must update multiple docs
4. Version bumps for significant changes

---

## 🚀 Quick Start

**New Developer Onboarding:**

1. Read [System Overview](./00-system-overview.md) (15 min)
2. Skim [Technology Stack](./05-technology-stack.md) (10 min)
3. Explore [Component Architecture](./04-component-architecture.md) (20 min)
4. Review [Data Architecture](./01-data-architecture.md) (30 min)

**Total Time**: ~75 minutes for comprehensive understanding

---

## ❓ Questions?

If you have questions about the architecture:

1. Check the relevant document first
2. Search for similar patterns in the codebase
3. Review implementation plans in `/web/documentation/implementation-plans/`
4. Consult code review standards in `/web/documentation/agent-guidelines/`

---

**Last Updated**: 2025-10-02  
**Documentation Version**: 2.4  
**Project Version**: Code Organization & Architecture Improvements
