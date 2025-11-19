# Profile & User Management System

**Last Updated**: 2025-09-30  
**Version**: 1.0

## Overview

The Profile & User Management system provides comprehensive user account management, statistics tracking, and personalization features. It integrates with Firebase Auth, Firestore, and Storage to deliver a complete user experience.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Profile Page (Profile.svelte)           │
│                                                           │
│  ┌────────────────┐  ┌─────────────────────────────┐   │
│  │ StatsActivity  │  │ PersonalInfoSettings       │   │
│  │                │  │                              │   │
│  │ • Total Cards  │  │ • Display Name              │   │
│  │ • Reviews      │  │ • Photo Upload              │   │
│  │ • Streak       │  │ • Email                     │   │
│  │ • Activity     │  │ • Password Change Modal     │   │
│  └────────────────┘  └─────────────────────────────┘   │
│                                                           │
│  ┌────────────────┐  ┌─────────────────────────────┐   │
│  │CreateSettings  │  │ AccountManagement           │   │
│  │                │  │                              │   │
│  │ • Confirm      │  │ • Change Password           │   │
│  │   Delete       │  │ • Delete Account (w/modal)  │   │
│  │                │  │ • Sign Out                  │   │
│  └────────────────┘  └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│               Supporting Systems                         │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  userStats   │  │  toastStore  │  │   Firebase   │  │
│  │  Utilities   │  │              │  │   Services   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Core Features

### 1. User Statistics

**Location**: `/src/lib/db/userStats.js`

Provides real-time calculation of user statistics from flashcard data.

#### Statistics Calculated

```javascript
{
  totalCards: number,        // Total flashcards created
  totalDecks: number,        // Number of decks (currently always 1)
  reviewsToday: number,      // Reviews completed today
  streakDays: number,        // Consecutive days with reviews
  totalReviews: number,      // All-time review count
  masteryStats: {            // Breakdown by mastery level
    new: number,
    learning: number,
    mastered: number
  },
  successRate: number        // Overall success percentage
}
```

#### Key Functions

```javascript
// Calculate comprehensive user statistics
export function calculateUserStats(flashcards)

// Get cards due for review today
export function getCardsDueToday(flashcards)

// Get recent activity timeline
export function getRecentActivity(flashcards, limit = 10)
```

#### Streak Calculation Algorithm

```javascript
function calculateStreak(reviewDates, now) {
  // Start from today and go backwards
  // Count consecutive days with at least one review
  // Breaks on first day without reviews
  // Returns number of consecutive days
}
```

**Features:**

- Real-time calculation from flashcard data
- Reactive updates when flashcards change
- Efficient client-side computation
- Handles edge cases (no data, timezone issues)

### 2. Profile Information Management

**Component**: `/src/lib/profile/PersonalInfoSettings.svelte`

Manages user profile data stored in Firebase Auth.

#### Editable Fields

1. **Display Name**
   - Stored in Firebase Auth
   - Updates immediately across all sessions
   - Syncs to `userStore`

2. **Photo URL**
   - Manual URL input
   - Validated on save

3. **Email Address**
   - Read-only display
   - Cannot be changed from profile (security)

4. **Profile Photo Upload**
   - File upload to Firebase Storage
   - Automatic URL generation
   - Updates Firebase Auth profile
   - Live preview

#### Profile Update Flow

```
User edits fields
    │
    ▼
Click "Save changes"
    │
    ▼
Validate inputs (client-side)
    │
    ▼
Call updateProfile(auth.currentUser, {...})
    │
    ▼
Reload user data (auth.currentUser.reload())
    │
    ▼
Update userStore (force sync)
    │
    ▼
Show success toast
    │
    ▼
UI updates reactively (navbar, profile display)
```

#### Photo Upload Flow

```
User selects file
    │
    ▼
Validate file (client-side)
    │
    ▼
Upload to Storage: avatars/{uid}/{timestamp}_{filename}
    │
    ▼
Get download URL
    │
    ▼
Update Firebase Auth photoURL
    │
    ▼
Force userStore sync
    │
    ▼
Show success toast + live preview
```

**Features:**

- Real-time validation
- Loading states during save
- Error handling with user-friendly messages
- Optimistic UI updates
- Toast notifications

### 3. Password Management

**Component**: `/src/lib/profile/PersonalInfoSettings.svelte`

Implements secure password change with re-authentication.

#### Password Change Flow

```
User clicks "Change password"
    │
    ▼
Open password modal
    │
    ▼
User enters:
  • Current password
  • New password
  • Confirm new password
    │
    ▼
Client-side validation:
  • Current password not empty
  • New password ≥ 6 characters
  • Passwords match
    │
    ▼
Re-authenticate with current password
  (Security requirement by Firebase)
    │
    ▼
Call updatePassword(auth.currentUser, newPassword)
    │
    ▼
Success toast + close modal
```

#### Security Features

1. **Re-authentication Required**
   - Firebase requires recent login
   - Re-authenticate with current password
   - Prevents unauthorized password changes

2. **Password Validation**
   - Minimum 6 characters (Firebase default)
   - Confirmation matching
   - Real-time error feedback

3. **Error Handling**
   ```javascript
   'auth/wrong-password'        → Current password incorrect
   'auth/weak-password'         → New password too weak
   'auth/requires-recent-login' → Re-login required
   ```

**Implementation:**

```javascript
async function handlePasswordChange() {
  // 1. Validate form
  if (!validatePasswordForm()) return

  // 2. Re-authenticate
  const credential = EmailAuthProvider.credential(
    auth.currentUser.email,
    passwordForm.currentPassword
  )
  await reauthenticateWithCredential(auth.currentUser, credential)

  // 3. Update password
  await updatePassword(auth.currentUser, passwordForm.newPassword)

  // 4. Show success + close modal
}
```

### 4. Account Deletion

**Component**: `/src/lib/profile/AccountManagement.svelte`

Implements secure account deletion with comprehensive data cleanup.

#### Account Deletion Flow

```
User clicks "Delete account"
    │
    ▼
Open confirmation modal with warnings
    │
    ▼
User must:
  • Type "DELETE" to confirm
  • Enter password (for email/password users)
    │
    ▼
Re-authenticate with password (security)
    │
    ▼
Delete user data in order:
  1. All flashcards (Firestore)
  2. All tags (Firestore)
  3. Uploaded photos (Storage)
    │
    ▼
Delete Firebase Auth user account
    │
    ▼
Success toast + redirect to login
```

#### Data Cleanup

**Firestore Collections:**

```javascript
// Delete all flashcards
const flashcardsQuery = query(collection(db, 'flashcards'), where('userId', '==', userId))
const flashcardsSnapshot = await getDocs(flashcardsQuery)
await Promise.all(flashcardsSnapshot.docs.map(doc => deleteDoc(doc.ref)))

// Delete all tags
const tagsQuery = query(collection(db, 'tags'), where('userId', '==', userId))
const tagsSnapshot = await getDocs(tagsQuery)
await Promise.all(tagsSnapshot.docs.map(doc => deleteDoc(doc.ref)))
```

**Firebase Storage:**

```javascript
// Delete all uploaded avatars
const avatarsRef = ref(storage, `avatars/${userId}`)
const avatarsList = await listAll(avatarsRef)
await Promise.all(avatarsList.items.map(item => deleteObject(item)))
```

**Firebase Auth:**

```javascript
// Finally, delete the user account
await deleteUser(auth.currentUser)
```

#### Safety Features

1. **Confirmation Dialog**
   - Must type "DELETE" exactly
   - Clear warning about data loss
   - Lists all data that will be deleted

2. **Password Verification**
   - Required for email/password users
   - Re-authentication before deletion

3. **Graceful Error Handling**
   - Storage deletion failures are non-critical
   - Continue even if some data fails
   - User-friendly error messages

4. **Post-Deletion**
   - Success message shown
   - Automatic redirect to login page
   - 2-second delay for user to read message

### 5. Activity Timeline

**Location**: `/src/lib/db/userStats.js`

Generates recent activity feed from flashcard data.

#### Activity Types

1. **Flashcard Creation**

   ```javascript
   {
     date: "Today",
     action: "Created flashcard: 안녕하세요",
     type: "create"
   }
   ```

2. **Review Activity**
   ```javascript
   {
     date: "Yesterday",
     action: "Reviewed \"감사합니다\" - ✓ Correct",
     type: "review"
   }
   ```

#### Activity Generation

```javascript
export function getRecentActivity(flashcards, limit = 10) {
  const activities = []

  flashcards.forEach(card => {
    // Add creation activity
    if (card.createdAt) {
      activities.push({
        date: card.createdAt,
        action: `Created flashcard: ${card.targetVocabulary}`,
        type: 'create',
      })
    }

    // Add review activity
    if (card.lastReviewedAt) {
      const wasCorrect = card.streak > 0
      activities.push({
        date: card.lastReviewedAt,
        action: `Reviewed "${card.targetVocabulary}" - ${wasCorrect ? '✓' : '✗'}`,
        type: 'review',
      })
    }
  })

  // Sort by date (newest first) and limit
  return activities
    .sort((a, b) => b.date - a.date)
    .slice(0, limit)
    .map(formatActivity)
}
```

#### Date Formatting

```javascript
function formatDate(timestamp) {
  const diffDays = getDaysDifference(timestamp, now)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
```

### 6. Toast Notification System

**Location**: `/src/lib/stores/toastStore.js`, `/src/lib/Toast.svelte`

Global notification system for user feedback.

#### Toast Types

```javascript
showSuccess(message, (duration = 3000)) // Green, checkmark
showError(message, (duration = 4000)) // Red, error icon
showInfo(message, (duration = 3000)) // Blue, info icon
showWarning(message, (duration = 3000)) // Yellow, warning icon
```

#### Usage in Components

```javascript
import { showSuccess, showError } from '../stores/toastStore.js'

try {
  await updateProfile(...)
  showSuccess('Profile updated successfully!')
} catch (error) {
  showError('Failed to update profile. Please try again.')
}
```

#### Toast Store Structure

```javascript
// Store holds array of active toasts
export const toasts = writable([])

// Each toast:
{
  id: string,           // Unique ID
  message: string,      // Display message
  type: 'success' | 'error' | 'info' | 'warning',
  duration: number      // Auto-dismiss time (ms)
}
```

#### Toast Component

- **Position**: Fixed top-right (below navbar)
- **Animation**: Slide in from right
- **Auto-dismiss**: After specified duration
- **Manual dismiss**: Click X button
- **Stacking**: Multiple toasts stack vertically
- **Responsive**: Full-width on mobile

## Component Architecture

### Profile Page Layout

```svelte
<Profile>
  <StatsActivity>
    • Total Decks • Total Cards • Reviews Today • Streak Days • Recent Activity List
  </StatsActivity>

  <PersonalInfoSettings>
    • Display Name Input • Photo URL Input • Email (read-only) • Photo Upload • Save Button • Change
    Password Button → Modal
  </PersonalInfoSettings>

  <CreateSettings>• Confirm Before Delete Checkbox</CreateSettings>

  <AccountManagement>
    • Change Password Button • Delete Account Button → Modal • Sign Out Button
  </AccountManagement>
</Profile>
```

### Modal Pattern

Both password change and account deletion use modal overlays:

```svelte
{#if showModal}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal" on:click|stopPropagation>
      <div class="modal__header">
        <h3>Title</h3>
        <button on:click={closeModal}>×</button>
      </div>

      <div class="modal__content">
        <!-- Form or content -->
      </div>

      <div class="modal__actions">
        <button on:click={closeModal}>Cancel</button>
        <button type="submit">Confirm</button>
      </div>
    </div>
  </div>
{/if}
```

**Modal Features:**

- Click outside to close
- ESC key to close (future enhancement)
- Accessible (ARIA roles, labels)
- Loading states during operations
- Error display inline

## Data Flow

### Stats Calculation Flow

```
flashcardsStore updates
    │
    ▼
Profile.svelte reactive statement triggers
  $: if ($flashcardsStore) { ... }
    │
    ▼
calculateUserStats($flashcardsStore)
    │
    ▼
Update local stats variable
    │
    ▼
Pass stats to StatsActivity component
    │
    ▼
StatsActivity displays updated numbers
```

### Profile Update Flow

```
User edits display name in PersonalInfoSettings
    │
    ▼
User clicks "Save changes"
    │
    ▼
handleSubmit() in PersonalInfoSettings
    │
    ├─→ updateProfile(auth.currentUser, { displayName, photoURL })
    ├─→ auth.currentUser.reload()
    └─→ userStore.set(auth.currentUser)
            │
            ▼
    onAuthStateChanged fires (Firebase)
            │
            ▼
    userStore updates (authStore.js)
            │
            ▼
    Profile.svelte reactive statement updates local profile
            │
            ▼
    NavBar updates (shows new display name/photo)
```

## Security Considerations

### 1. Re-authentication

Critical operations (password change, account deletion) require re-authentication:

```javascript
const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword)
await reauthenticateWithCredential(auth.currentUser, credential)
```

**Why?**

- Firebase security requirement
- Prevents unauthorized changes
- Ensures user is present and authenticated

### 2. Confirmation Patterns

**Password Change:**

- Enter current password
- Enter new password twice
- Client-side validation

**Account Deletion:**

- Type "DELETE" to confirm
- Enter password for verification
- Show warning with data loss details

### 3. Data Isolation

All queries filter by `userId`:

```javascript
where('userId', '==', auth.currentUser.uid)
```

Ensures users can only delete their own data.

### 4. Error Handling

Never expose internal errors to users:

```javascript
try {
  await deleteUser(auth.currentUser)
} catch (error) {
  console.error('Internal error:', error)
  showError('Failed to delete account. Please try again.')
  // Generic message, specific error logged
}
```

## Performance Optimizations

### 1. Client-Side Calculations

Stats calculated from already-loaded flashcard data:

- No additional database queries
- Reactive updates (Svelte)
- Efficient algorithms (O(n) complexity)

### 2. Batch Operations

Account deletion uses `Promise.all()`:

```javascript
const deletePromises = docs.map(doc => deleteDoc(doc.ref))
await Promise.all(deletePromises)
```

Deletes all documents in parallel instead of sequentially.

### 3. Optimistic UI

Profile updates show immediately:

- Update local state first
- Sync to Firebase in background
- Show loading states
- Revert on error (future enhancement)

### 4. Toast Cleanup

Toasts auto-dismiss to prevent memory leaks:

```javascript
setTimeout(() => {
  dismissToast(id)
}, duration)
```

## Accessibility

### ARIA Labels

```html
<section aria-labelledby="profile-title">
  <h2 id="profile-title">My Profile</h2>
</section>

<button aria-label="Close modal">×</button>

<div role="alert" aria-live="polite">{toast.message}</div>
```

### Keyboard Navigation

- All interactive elements keyboard accessible
- Modal focus trap (future enhancement)
- ESC to close modals (future enhancement)

### Screen Readers

- Semantic HTML (sections, headings, forms)
- Label associations (`for` attribute)
- Live regions for dynamic content (toasts)

## Future Enhancements

### Planned Features

1. **Email Verification**
   - Send verification email
   - Show verification badge
   - Prompt unverified users

2. **Email Change**
   - Change email with verification
   - Re-authentication required

3. **Advanced Statistics**
   - Weekly/monthly review charts
   - Mastery level distribution
   - Study time tracking
   - Cards due visualization

4. **Profile Enhancements**
   - Image cropping tool
   - Default avatar selection
   - Bio/about section
   - Public profile option

5. **Activity Enhancements**
   - Detailed activity log in Firestore
   - Filter by activity type
   - Export activity history

6. **Gamification**
   - Achievement badges
   - Longest streak tracking
   - Milestone celebrations
   - Streak freeze feature

### Technical Improvements

1. **Optimistic UI with Rollback**
   - Show changes immediately
   - Revert on error
   - Retry mechanism

2. **Form Validation Library**
   - Replace manual validation
   - Use library like Yup or Zod
   - Better error messages

3. **Modal Component**
   - Extract to reusable component
   - Focus trap implementation
   - ESC key handler

4. **Photo Optimization**
   - Client-side compression
   - Image resizing before upload
   - Format conversion (WebP)

## Testing

### Manual Testing Checklist

**Profile Information:**

- [ ] Update display name
- [ ] Update photo URL
- [ ] Upload profile photo
- [ ] Changes reflect in navbar immediately
- [ ] Changes persist after page refresh

**Password Change:**

- [ ] Open password modal
- [ ] Enter incorrect current password → Error
- [ ] Enter weak new password → Error
- [ ] Enter non-matching confirmation → Error
- [ ] Successfully change password
- [ ] Log out and log in with new password

**Account Deletion:**

- [ ] Open delete modal
- [ ] Try to submit without typing "DELETE" → Error
- [ ] Try to submit without password → Error
- [ ] Enter incorrect password → Error
- [ ] Successfully delete account
- [ ] Verify all data deleted (flashcards, tags, photos)
- [ ] Verify redirected to login
- [ ] Verify cannot log in with old credentials

**Statistics:**

- [ ] Create new flashcard → Total cards increases
- [ ] Review flashcard → Reviews today increases
- [ ] Review on consecutive days → Streak increases
- [ ] Skip a day → Streak resets

**Activity Timeline:**

- [ ] Create flashcard → Appears in timeline
- [ ] Review flashcard → Appears in timeline
- [ ] Timeline shows most recent first
- [ ] Dates formatted correctly

**Toast Notifications:**

- [ ] Success toast shows on successful operations
- [ ] Error toast shows on failures
- [ ] Toasts auto-dismiss
- [ ] Can manually dismiss toasts
- [ ] Multiple toasts stack correctly

## Related Documentation

- [System Overview](./00-system-overview.md)
- [Authentication System](./02-authentication-system.md)
- [Data Architecture](./01-data-architecture.md)
- [Study & Review System](./03-study-review-system.md)

---

**Last Updated**: 2025-09-30  
**Version**: 1.0
