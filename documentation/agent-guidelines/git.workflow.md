# Git Workflow Guidelines

This document provides detailed git workflow patterns and standards referenced in the main agent rules.

## 1. Commit Message Standards

### 1.1 Commit Message Prefixes

- include scope in parenthesis
- "fix" for bug fixes
- "feat" for new features
- "perf" for performance improvements
- "docs" for documentation changes
- "style" for formatting changes
- "refactor" for code refactoring
- "chore" for maintenance tasks

### 1.2 Commit Rules

- Use lowercase for commit messages
- Keep the summary line concise
- Include description for non-obvious changes
- Reference issue numbers when applicable
- Define scope in parenthesis
- Example: `refactor(schemas): extract validation utilities`

## 2. Code Review

Code review standards have moved to `documentation/agent-guidelines/code-review-standards.md`. This file focuses on git conventions and workflow only.

### 2.1 How to Review PRs (at a glance)

- Read PR description and linked issues
- Run build/lint/tests locally if applicable
- Skim changes for scope creep and unrelated edits
- Check accessibility on interactive changes
- Defer to full checklist in `documentation/agent-guidelines/code-review-standards.md`
