# Code Review Standards

This document defines how we review code at Lingua. Use it for PR reviews, self‑reviews, and pre‑merge checks.

## 1. Core Principles

- **Readability**: Clear, concise code with meaningful names.
- **SRP/DRY/Modularity**: Single responsibility, avoid duplication, and maintain clear component boundaries.
- **Idiomatic Usage**: Follow official patterns for Svelte 5/SvelteKit
- **Technical Debt**: Remove bloat and redundancies as you touch code.
- **Error Handling**: Consistent, actionable errors; no swallowed exceptions.
- **Security & Performance**: No new vulnerabilities; no unexpected regressions.

## 2. Review Checklist

### 2.1 Functional Correctness

- No regressions; existing behaviors preserved
- Edge cases identified and handled

### 2.2 Maintainability and Design

- Code is easy to read and navigate
- Adheres to Single Responsibility Principle (SRP)
- Eliminates duplication (DRY)
- Eliminates any unused variables
- Decoupled, modular components with clear boundaries
- Uses idiomatic project/library patterns
- Removes legacy code and bloat where feasible
- Consistent, appropriate error handling

### 2.3 Compliance and Security
- No new security flaws; auth and data access patterns respected
- No unexpected performance degradation or resource spikes

### 2.4 Architecture & Patterns Alignment

- Domain‑driven multi‑store architecture is respected
- Smart Store pattern is followed for feature‑domain stores
- Svelte 5 Runes patterns and accessibility requirements are followed
- Optimistic UI patterns are used for mutations where appropriate

## 4. Review Process (minimal)

- Verify accessibility and keyboard navigation for interactive UI
- Prefer concrete suggestions and links to guidelines when requesting changes