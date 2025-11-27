# Authentication and Session Management Patterns

This document provides detailed patterns for user authentication and session management.

## 1. Authentication Framework

- **Primary Auth**: Firebase Authentication
- **Session Management**: Server-side via `hooks.server.ts`

## 2. Server Hooks Architecture (current)

**File**: `src/hooks.server.ts`

- Default‑deny model: all routes are considered protected unless explicitly allowlisted.
- Public allowlists:
  - UI: `/`, `/register`, `/login`, `/logout`, `/email-action`, `/pricing`, `/terms`, `/privacy`
  - API: `/api/auth`, `/api/verification`
- Assets always allowed: `/_app`, `/build`, `/static`, `/fonts`, `/favicon.ico`
- Unauthenticated users:
  - Public UI/API + assets allowed
  - Non-public API → 401 JSON `{ code: 'UNAUTHENTICATED' }`
  - Non-public UI → redirect to `/login?redirect=…`
- Verified users: proceed normally

## 3. Data Access Patterns

### 3.1 `locals.uid` vs `locals.user`

**CRITICAL**: Understanding the distinction between these two is essential for security and data consistency.

#### `locals.uid` (Ground Truth)

- **What**: Raw Firebase Authentication user ID (UID) from decoded session token
- **Source**: Directly obtained in `hooks.server.ts` from Firebase Auth
- **Usage**: **MUST** be used for all backend database queries and lookups in Firestore
- **Security**: This is the ground truth for user identity - ensures data consistency and security

```typescript
// ✅ CORRECT: Use locals.uid for database operations
export const POST = async ({ locals }) => {
	const userDoc = await db.collection('users').doc(locals.uid).get();
	// ... API logic using locals.uid for queries
};
```

#### `locals.user` (UI Profile)

- **What**: Application-specific user profile from Firestore `users` collection
- **Source**: Fetched from database using `locals.uid`
- **Usage**: Should be used primarily for rendering content on the client-side
- **Content**: Contains UI-relevant data (name, email, display preferences, etc.)

```svelte
<!-- ✅ CORRECT: Use locals.user for UI rendering -->
<script>
	export let data;
	const { user } = data; // This comes from locals.user
</script>

<h1>Welcome, {user.displayName}!</h1>
```

## 4. Implementation Rules

### 4.1 API Endpoints

**Rule**: Always use `locals.uid` for API endpoint logic and database operations

```typescript
// ✅ CORRECT: API endpoint using locals.uid
export const POST = async ({ request, locals }) => {
	if (!locals.uid) {
		throw error(401, 'Unauthorized');
	}

	// Use locals.uid for all database queries
	const result = await someService.processForUser(locals.uid);
	return json(result);
};
```

### 4.2 Page Load Functions

**Rule**: Use `locals.user` for populating UI elements

```typescript
// ✅ CORRECT: Page load function
export const load = async ({ locals }) => {
	return {
		user: locals.user // Pass user profile to UI
	};
};
```

## 5. Session & Registration Flow

- Step 1 (Create Account): client creates Firebase Auth user, calls `/api/auth/session` to exchange ID token for a server session cookie; server ensures `users/{uid}` and `settings/{uid}` exist.
- Gating is enforced solely in `hooks.server.ts` per rules in section 2.

Notes:

- `verifySessionCookie` performs best-effort self‑heal to create missing user/settings and mirrors verified timestamps from Auth.
- Use `sameSite: 'lax'` for session cookie; client fetches include `credentials: 'include'` when exchanging ID token.

## 6. Security Considerations

- Never expose `locals.uid` directly to the client-side
- Always validate user permissions before database operations
- Use `locals.uid` as the source of truth for all authorization decisions
- Ensure proper error handling for authentication failures
