# Test Checklist for Code Review Changes

This checklist covers all changes made during the code review session. Use it to verify that the application works correctly after the updates.

---

## Pre-Test Setup

1. [ ] Run `npm install` (if dependencies changed)
2. [ ] Start the development server: `npm run dev`
3. [ ] Open the app in a browser at `http://localhost:5173` (or configured port)

---

## 1. Toast Notification System

The `alert()` calls have been replaced with a toast notification system.

### 1.1 Toast Appearance Tests

| Test | Steps | Expected Result | Pass/Fail |
|------|-------|-----------------|-----------|
| Success toast displays | 1. Log in<br>2. Enter text and parse it<br>3. Add a note<br>4. Click Save | Green-bordered toast appears in bottom-right with success message | [ ] |
| Error toast displays | 1. Try to save without logging in<br>2. Or trigger a save error | Red-bordered toast appears with error message | [ ] |
| Warning toast displays | 1. While logged out, click "Create Flashcards" | Yellow-bordered toast appears with "Please log in" message | [ ] |
| Toast auto-dismisses | 1. Trigger any toast | Toast disappears after ~4 seconds | [ ] |
| Toast manual dismiss | 1. Trigger a toast<br>2. Click the X button | Toast immediately disappears | [ ] |
| Multiple toasts stack | 1. Rapidly trigger multiple actions | Toasts stack vertically without overlap | [ ] |

### 1.2 Toast Accessibility Tests

| Test | Steps | Expected Result | Pass/Fail |
|------|-------|-----------------|-----------|
| Screen reader announces | 1. Enable screen reader<br>2. Trigger a toast | Toast content is announced | [ ] |
| Keyboard dismiss | 1. Tab to dismiss button<br>2. Press Enter | Toast is dismissed | [ ] |

### 1.3 Toast Reduced Motion Test

| Test | Steps | Expected Result | Pass/Fail |
|------|-------|-----------------|-----------|
| Reduced motion respected | 1. Enable "Reduce Motion" in OS settings<br>2. Trigger a toast | Toast appears without slide animation | [ ] |

---

## 2. Navigation Bar

### 2.1 Visual Tests

| Test | Steps | Expected Result | Pass/Fail |
|------|-------|-----------------|-----------|
| Icons use correct color | 1. View navigation bar | All icons appear in teal/accent color (`#76abae`) | [ ] |
| Expand/collapse works | 1. Click expand button | Navigation expands to show labels | [ ] |
| Labels appear on expand | 1. Expand navigation | Each icon has a text label next to it | [ ] |

### 2.2 Functional Tests

| Test | Steps | Expected Result | Pass/Fail |
|------|-------|-----------------|-----------|
| Home navigation | Click Home icon | Navigates to /home | [ ] |
| Sentence Library opens | Click Sentences icon | Sentence Library modal opens | [ ] |
| Deck Library opens | Click Decks icon | Deck Library modal opens | [ ] |
| Settings opens | Click Settings icon | Settings modal opens | [ ] |
| How To Use opens | Click How To Use icon | How To Use modal opens | [ ] |
| Login/Logout works | Click Login/Logout icon | Navigates to login or logs out | [ ] |

### 2.3 Accessibility Tests

| Test | Steps | Expected Result | Pass/Fail |
|------|-------|-----------------|-----------|
| Keyboard navigation | Tab through nav items | All items are focusable in order | [ ] |
| Focus visible | Tab to any nav item | Focus ring is visible | [ ] |
| Screen reader labels | Use screen reader on nav | All buttons have descriptive labels | [ ] |

---

## 3. Toolbar

### 3.1 Visual Tests

| Test | Steps | Expected Result | Pass/Fail |
|------|-------|-----------------|-----------|
| Icons use correct color | 1. View toolbar | All icons appear in off-white (`#eeeeee`) | [ ] |
| Active mode highlighted | 1. Switch between modes | Active mode button has teal background | [ ] |
| Active action has border | 1. Click a toolbar action | Active action has teal border | [ ] |
| Divider visible | 1. View toolbar | Vertical divider separates mode switches from actions | [ ] |

### 3.2 Functional Tests

| Test | Steps | Expected Result | Pass/Fail |
|------|-------|-----------------|-----------|
| Switch to Parsing Mode | Click ABC icon | Parsing mode activates, toolbar shows parsing actions | [ ] |
| Switch to Flashcard Mode | Click Flashcard icon | Flashcard mode activates, toolbar shows flashcard actions | [ ] |
| New Text action | In parsing mode, click New Text | Switches to text input view | [ ] |
| Parse action | After entering text, click Parse | Switches to parse view with morphemes | [ ] |
| Edit action | Click Edit | Switches to edit view | [ ] |
| Create Flashcards action | Click Create Flashcards | Opens flashcard creation modal (if logged in) | [ ] |
| Save action | Click Save | Saves sentence (shows toast feedback) | [ ] |
| History action | Click History | Opens/closes history panel | [ ] |

---

## 4. Parse Mode

### 4.1 Visual Tests

| Test | Steps | Expected Result | Pass/Fail |
|------|-------|-----------------|-----------|
| Background color correct | 1. View parse mode | Background is dark grey (`#222831`) | [ ] |
| Prefetch banner styled | 1. Have saved sentences<br>2. View parse mode | Banner has section background color | [ ] |
| Chips styled correctly | 1. View prefetch banner | Chips have main background color | [ ] |
| History glance styled | 1. Have history entries<br>2. View parse mode | History section uses correct colors | [ ] |

### 4.2 Functional Tests

| Test | Steps | Expected Result | Pass/Fail |
|------|-------|-----------------|-----------|
| Text input works | 1. Type text in input | Text appears, submit button shows | [ ] |
| Submit via Enter | 1. Type text<br>2. Press Enter | Text is submitted, parsing begins | [ ] |
| Submit via button | 1. Type text<br>2. Click Submit | Text is submitted, parsing begins | [ ] |
| Morphemes display | 1. Submit text | Text is tokenized into morpheme nodes | [ ] |
| Break morpheme | 1. Click morpheme<br>2. Click Break<br>3. Position cursor<br>4. Press Space/Enter | Morpheme splits at cursor position | [ ] |
| Combine morphemes | 1. Select multiple morphemes<br>2. Click Combine | Morphemes merge into one | [ ] |
| Add vocab note | 1. Click morpheme<br>2. Click Vocab Note<br>3. Fill form | Note is added, indicator appears | [ ] |
| Add grammar note | 1. Click morpheme<br>2. Click Grammar Note<br>3. Fill form | Note is added, indicator appears | [ ] |

---

## 5. Flashcard Mode

### 5.1 Visual Tests

| Test | Steps | Expected Result | Pass/Fail |
|------|-------|-----------------|-----------|
| Card displays correctly | 1. Have flashcards<br>2. View flashcard mode | Card shows front content | [ ] |
| Flip animation smooth | 1. Click card or press Space | Card flips with 3D animation | [ ] |
| Correct button styled | 1. Flip card | Green gradient on correct button | [ ] |
| Incorrect button styled | 1. Flip card | Red gradient on incorrect button | [ ] |

### 5.2 Functional Tests

| Test | Steps | Expected Result | Pass/Fail |
|------|-------|-----------------|-----------|
| Navigate cards | 1. Click arrow buttons | Moves to next/previous card | [ ] |
| Keyboard navigation | 1. Press Arrow keys | Moves to next/previous card | [ ] |
| Flip with Space | 1. Press Space | Card flips | [ ] |
| Shuffle deck | 1. Click Shuffle | Cards are randomized | [ ] |
| Mark correct | 1. Flip card<br>2. Click checkmark | Logged to history, moves to next card | [ ] |
| Mark incorrect | 1. Flip card<br>2. Click X | Logged to history, moves to next card | [ ] |

### 5.3 Touch Tests (Mobile)

| Test | Steps | Expected Result | Pass/Fail |
|------|-------|-----------------|-----------|
| Swipe left | Swipe left on card | Goes to next card | [ ] |
| Swipe right | Swipe right on card | Goes to previous card | [ ] |
| Swipe up/down | Swipe up or down on card | Card flips | [ ] |

---

## 6. Session Store (Import/Export)

### 6.1 Export Tests

| Test | Steps | Expected Result | Pass/Fail |
|------|-------|-----------------|-----------|
| Export downloads file | 1. Parse some text<br>2. Export session | JSON file downloads | [ ] |
| Export contains data | 1. Open exported file | Contains mode, sentence, morphemes | [ ] |

### 6.2 Import Tests

| Test | Steps | Expected Result | Pass/Fail |
|------|-------|-----------------|-----------|
| Import valid file | 1. Import previously exported file | Session state restored | [ ] |
| Import invalid JSON | 1. Import malformed JSON file | Error toast appears, state unchanged | [ ] |
| Import wrong structure | 1. Import JSON with wrong schema | Error toast appears, state unchanged | [ ] |

---

## 7. Design System Consistency

### 7.1 Color Variable Tests

| Test | Steps | Expected Result | Pass/Fail |
|------|-------|-----------------|-----------|
| Main background | View any page | Background is `#222831` | [ ] |
| Section background | View modals, panels | Background is `#31363f` | [ ] |
| Primary text | View accent text | Color is `#76abae` | [ ] |
| Secondary text | View body text | Color is `#eeeeee` | [ ] |
| Button hover | Hover over buttons | Background changes to `#415780` | [ ] |

---

## 8. Accessibility Checklist

| Test | Steps | Expected Result | Pass/Fail |
|------|-------|-----------------|-----------|
| Focus indicators | Tab through app | All interactive elements have visible focus | [ ] |
| ARIA labels | Inspect with dev tools | All buttons have aria-label | [ ] |
| Keyboard-only use | Navigate without mouse | All features accessible | [ ] |
| Color contrast | Check with contrast tool | Text meets WCAG AA standards | [ ] |
| Reduced motion | Enable reduced motion | Animations are disabled | [ ] |

---

## 9. Error Handling

| Test | Steps | Expected Result | Pass/Fail |
|------|-------|-----------------|-----------|
| Save without login | Try to save while logged out | Warning toast appears | [ ] |
| Create flashcard without login | Try to create flashcard while logged out | Warning toast appears | [ ] |
| Network error | Disconnect network, try to save | Error toast appears | [ ] |
| Empty text save | Try to save empty text | Error toast appears | [ ] |

---

## Summary

| Section | Total Tests | Passed | Failed |
|---------|-------------|--------|--------|
| Toast Notifications | 10 | | |
| Navigation Bar | 12 | | |
| Toolbar | 14 | | |
| Parse Mode | 12 | | |
| Flashcard Mode | 12 | | |
| Session Store | 4 | | |
| Design System | 5 | | |
| Accessibility | 5 | | |
| Error Handling | 4 | | |
| **TOTAL** | **78** | | |

---

## Notes

- Record any bugs or issues found during testing here
- Include browser/device information for reproducibility

### Issues Found:
1. 
2. 
3. 

### Browser/Device Tested:
- Browser: 
- Version: 
- OS: 
- Device: 

