# Authentication System

## Overview

FLIP uses Firebase Authentication to provide secure, multi-method user authentication with session persistence and state management through Svelte stores.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Client Layer                        │
│                                                       │
│  ┌────────────────────────────────────────────┐    │
│  │          authStore.js                       │    │
│  │  ┌──────────────┐  ┌──────────────────┐   │    │
│  │  │  userStore   │  │  Auth Functions  │   │    │
│  │  │  (writable)  │  │  • Login         │   │    │
│  │  │              │  │  • Signup        │   │    │
│  │  │ Derived:     │  │  • OAuth         │   │    │
│  │  │ • userId     │  │  • Magic Link    │   │    │
│  │  │ • isLoggedIn │  │  • Phone         │   │    │
│  │  └──────────────┘  └──────────────────┘   │    │
│  └────────────────────────────────────────────┘    │
│                       │                              │
└───────────────────────┼──────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│              Firebase Auth Service                   │
│                                                       │
│  • onAuthStateChanged Listener                       │
│  • Email/Password Authentication                     │
│  • OAuth Providers (Google, GitHub, Apple)          │
│  • Magic Link (Email Link)                           │
│  • Phone Number + SMS                                │
│  • Session Persistence                               │
└─────────────────────────────────────────────────────┘
```

## Authentication Methods

### 1. Email & Password

**Location**: `authStore.js`

```javascript
// Sign Up
export async function signupWithEmailPassword(email, password, rememberMe)

// Sign In
export async function loginWithEmailPassword(email, password, rememberMe)

// Password Reset
export function resetPassword(email)
```

**Flow:**

```
User enters email + password
    │
    ▼
Form validation (client-side)
    │
    ▼
Call signupWithEmailPassword() or loginWithEmailPassword()
    │
    ├─→ Set persistence (local or session)
    │
    └─→ Firebase Auth API call
            │
            ├─→ Success: User object created
            │       │
            │       └─→ onAuthStateChanged fires
            │               │
            │               └─→ userStore updates
            │                       │
            │                       └─→ UI redirects/updates
            │
            └─→ Error: Return friendly error message
                    │
                    └─→ Display in UI
```

**Features:**
- Email validation
- Password strength requirements (Firebase default)
- Remember me option (session vs local storage)
- Friendly error messages

### 2. OAuth Providers

**Supported Providers:**
- Google
- GitHub  
- Apple (via OAuth 2.0)

**Implementation:**

```javascript
export async function loginWithProvider(name, rememberMe = true)

// Available providers
const availableProviders = {
  google: GoogleAuthProvider,
  github: GithubAuthProvider,
  apple: OAuthProvider('apple.com')
}
```

**Flow:**

```
User clicks OAuth button (e.g., "Sign in with Google")
    │
    ▼
Call loginWithProvider('google')
    │
    ▼
Set persistence preference
    │
    ▼
signInWithPopup(auth, googleProvider)
    │
    ▼
OAuth popup opens
    │
    ├─→ User grants permission
    │       │
    │       └─→ Popup returns credentials
    │               │
    │               └─→ onAuthStateChanged fires
    │                       │
    │                       └─→ userStore updates
    │                               │
    │                               └─→ UI redirects
    │
    └─→ User cancels/closes popup
            │
            └─→ Error: 'auth/popup-closed-by-user'
```

**Features:**
- Single-click social login
- No password management for users
- Automatic account linking (if configured)
- Profile photo retrieval

### 3. Magic Link (Email Link)

**Passwordless authentication via email link**

```javascript
// Send magic link
export async function sendMagicLink(email)

// Complete sign-in
export async function completeMagicLinkSignInIfPresent()
```

**Flow:**

```
Part 1: Sending Link
──────────────────
User enters email
    │
    ▼
Call sendMagicLink(email)
    │
    ▼
Firebase sends email with sign-in link
    │
    ▼
Store email in localStorage (for completion)
    │
    ▼
Show "Check your email" message


Part 2: Completing Sign-In
───────────────────────────
User clicks link in email
    │
    ▼
App loads with special URL parameter
    │
    ▼
completeMagicLinkSignInIfPresent() detects link
    │
    ▼
Retrieve email from localStorage
    │
    ▼
signInWithEmailLink(auth, email, link)
    │
    ▼
onAuthStateChanged fires
    │
    ▼
User signed in automatically
```

**Features:**
- No password required
- Secure (link expires after use)
- Email verification built-in
- Mobile-friendly

### 4. Phone Number (SMS)

**SMS-based verification**

```javascript
// Start phone sign-in
export async function startPhoneNumberSignIn(phoneNumber, containerId)

// Verify code
export async function confirmPhoneNumberSignIn(confirmationResult, code)
```

**Flow:**

```
User enters phone number
    │
    ▼
Initialize reCAPTCHA verifier (invisible)
    │
    ▼
Call startPhoneNumberSignIn(phoneNumber, 'recaptcha-container')
    │
    ▼
Firebase sends SMS with code
    │
    ▼
Return confirmationResult object
    │
    ▼
User enters verification code
    │
    ▼
Call confirmPhoneNumberSignIn(confirmationResult, code)
    │
    ▼
onAuthStateChanged fires
    │
    ▼
User signed in
```

**Features:**
- International phone number support
- reCAPTCHA spam protection
- Automatic verification code detection (some devices)

## State Management

### User Store

**Location**: `/src/lib/stores/authStore.js`

```javascript
// Primary store - holds Firebase User object
export const userStore = writable(null)

// Derived store - user ID only
export const userId = derived(userStore, (user) => 
  user ? user.uid : null
)

// Derived store - boolean login status
export const isLoggedIn = derived(userStore, (user) => 
  Boolean(user && user.uid)
)
```

**User Object Structure:**

```javascript
{
  uid: string,              // Unique user ID
  email: string,            // User email
  emailVerified: boolean,   // Email verification status
  displayName: string,      // User display name
  photoURL: string,         // Profile photo URL
  phoneNumber: string,      // Phone number (if used)
  providerId: string,       // Auth provider ID
  metadata: {
    creationTime: string,
    lastSignInTime: string
  }
}
```

### Real-Time Auth State Sync

```javascript
// Initialize listener on app load
onAuthStateChanged(auth, (user) => {
  userStore.set(user)
})
```

**Behavior:**
- Fires immediately with current auth state
- Fires on every auth state change (login, logout, token refresh)
- Automatically updates all subscribers
- Persists across page refreshes (based on persistence setting)

### Component Usage

```svelte
<script>
  import { isLoggedIn, userStore } from './stores/authStore.js'
</script>

{#if $isLoggedIn}
  <p>Welcome, {$userStore.displayName}!</p>
  <button on:click={logout}>Sign Out</button>
{:else}
  <a href="#/login">Sign In</a>
{/if}
```

## Session Persistence

### Persistence Modes

Firebase Auth supports two persistence modes:

```javascript
export async function choosePersistence(rememberMe) {
  const persistence = rememberMe 
    ? browserLocalPersistence   // Persist across browser sessions
    : browserSessionPersistence // Clear on browser close
  
  await setPersistence(auth, persistence)
}
```

**Local Persistence** (Remember Me = true):
- Stored in `localStorage`
- Survives browser restart
- Survives tab close
- Persists until explicit logout

**Session Persistence** (Remember Me = false):
- Stored in `sessionStorage`
- Cleared when tab closes
- Cleared on browser restart
- More secure for shared devices

### Implementation

```javascript
// Called before every authentication attempt
await choosePersistence(rememberMe)
await signInWithEmailAndPassword(auth, email, password)
```

## Error Handling

### Friendly Error Messages

```javascript
export function getFriendlyAuthErrorMessage(error) {
  const code = error?.code || 'auth/unknown'
  
  const map = {
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/wrong-password': 'Incorrect email or password.',
    'auth/user-not-found': 'Incorrect email or password.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    // ... more error codes
  }
  
  return map[code] || 'Sign-in failed. Please try again.'
}
```

**Usage in Components:**

```javascript
try {
  await loginWithEmailPassword(email, password, rememberMe)
} catch (error) {
  const friendlyMessage = getFriendlyAuthErrorMessage(error)
  formError = friendlyMessage // Display to user
}
```

### Error Categories

1. **Validation Errors**: Invalid email format, missing fields
2. **Credential Errors**: Wrong password, user not found
3. **Security Errors**: Too many attempts, account disabled
4. **Network Errors**: Connection issues, timeout
5. **Provider Errors**: OAuth popup closed, provider unavailable

## Security Features

### Built-In Firebase Security

1. **Rate Limiting**: Automatic protection against brute force
2. **Email Verification**: Optional email verification flow
3. **Password Requirements**: Minimum 6 characters (Firebase default)
4. **Token Management**: Automatic token refresh and validation
5. **CORS Protection**: Request origin validation

### Client-Side Security

1. **Session Timeout**: Tokens automatically expire and refresh
2. **Secure Cookies**: HTTP-only, secure flags (when deployed)
3. **HTTPS Only**: Enforced in production
4. **No Credential Storage**: Never store passwords client-side

### Data Isolation

All Firestore queries filter by authenticated user ID:

```javascript
// Automatic user scoping in stores
const q = query(
  collection(db, 'flashcards'),
  where('userId', '==', uid)  // Only user's own data
)
```

## User Profile Management

### Current Implementation

**Profile data stored in Firebase Auth:**
- Display name
- Photo URL
- Email

**Access in components:**

```javascript
import { userStore } from './stores/authStore.js'

// In component
$: displayName = $userStore?.displayName
$: photoURL = $userStore?.photoURL
```

### Future: Extended Profile in Firestore

**Planned `/users/{userId}` collection:**

```javascript
{
  uid: string,
  displayName: string,
  email: string,
  
  preferences: {
    nativeLanguage: string,
    targetLanguage: string,
    dailyGoal: number,
    notifications: boolean
  },
  
  stats: {
    totalCards: number,
    totalReviews: number,
    streak: number
  }
}
```

## Authentication Flow Diagrams

### Login Flow

```
┌─────────────┐
│  Login Page │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Enter Credentials│
└──────┬───────────┘
       │
       ▼
┌──────────────────┐      ┌──────────────┐
│ Validate Form    │─────▶│ Show Errors  │
└──────┬───────────┘      └──────────────┘
       │ Valid
       ▼
┌──────────────────┐
│ Set Persistence  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐      ┌──────────────┐
│ Firebase Auth    │─────▶│ Auth Error   │
│ signIn()         │ Error│ Display      │
└──────┬───────────┘      └──────────────┘
       │ Success
       ▼
┌──────────────────┐
│onAuthStateChanged│
│     Fires        │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ userStore.set()  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ UI Redirects to  │
│    Home Page     │
└──────────────────┘
```

### Logout Flow

```
User clicks "Sign Out"
    │
    ▼
Call logout()
    │
    ▼
Firebase Auth signOut()
    │
    ▼
Clear session/local storage
    │
    ▼
onAuthStateChanged fires (user = null)
    │
    ▼
userStore.set(null)
    │
    ▼
Firestore listeners tear down
    │
    ▼
flashcardsStore.set([])
    │
    ▼
tagsStore.set([])
    │
    ▼
UI shows logged-out state
```

## Integration with App

### Protected Routes

Currently, all routes are accessible without authentication, but data is user-scoped.

**Future: Route Guards**

```javascript
// Conceptual implementation
function requireAuth() {
  if (!get(isLoggedIn)) {
    location.hash = '#/login'
    return false
  }
  return true
}
```

### NavBar Integration

```svelte
<!-- NavBar.svelte -->
<script>
  import { userStore, isLoggedIn } from './stores/authStore.js'
</script>

{#if $isLoggedIn}
  <button>
    {#if $userStore.photoURL}
      <img src={$userStore.photoURL} alt="Profile" />
    {:else}
      <span>my profile</span>
    {/if}
  </button>
{:else}
  <button on:click={() => navigate('/login')}>login</button>
{/if}
```

### Data Scoping

All data operations automatically scoped to authenticated user:

```javascript
// flashcardsStore.js
const uid = get(userId)  // From authStore

if (!uid) {
  set([])  // Clear data when logged out
  return
}

const q = query(
  collection(db, 'flashcards'),
  where('userId', '==', uid)  // User-scoped query
)
```

## Testing Authentication

### Manual Testing Checklist

- [ ] Email/password signup
- [ ] Email/password login
- [ ] Remember me (local persistence)
- [ ] Don't remember me (session persistence)
- [ ] Google OAuth
- [ ] GitHub OAuth
- [ ] Password reset email
- [ ] Magic link send
- [ ] Magic link sign-in
- [ ] Phone number sign-in
- [ ] Logout
- [ ] Session persistence after page refresh
- [ ] Error messages display correctly
- [ ] Multi-device sync

### Error Scenarios to Test

- Invalid email format
- Wrong password
- Non-existent user
- Weak password
- Network disconnection
- OAuth popup closure
- Invalid phone number
- Wrong SMS code

## Related Documentation

- [System Overview](./00-system-overview.md)
- [Data Architecture](./01-data-architecture.md)
- [Component Architecture](./04-component-architecture.md)

---

**Last Updated**: 2025-09-30  
**Version**: 1.0
