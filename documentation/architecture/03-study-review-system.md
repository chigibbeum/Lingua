# Study & Review System

## Overview

FLIP implements an intelligent spaced repetition system (SRS) based on the SM-2 algorithm to optimize long-term memory retention. The system tracks user performance, calculates optimal review intervals, and provides visual feedback on mastery progress.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Study Interface                       │
│                  (Flashcard.svelte)                     │
│                                                           │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐      │
│  │   Flip   │ ───▶ │  Review  │ ───▶ │  Record  │      │
│  │   Card   │      │  Answer  │      │  Result  │      │
│  └──────────┘      └──────────┘      └──────────┘      │
│                          │                                │
│                          ▼                                │
│                    ┌──────────┐                          │
│                    │ ✓ Correct│                          │
│                    │ ✕ Wrong  │                          │
│                    └──────────┘                          │
└────────────────────────┼─────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Review Tracking System                      │
│              (reviews.js)                                │
│                                                           │
│  ┌───────────────────────────────────────────┐          │
│  │        calculateReviewUpdate()             │          │
│  │                                             │          │
│  │  1. Calculate quality score                │          │
│  │  2. Run SM-2 algorithm                     │          │
│  │  3. Update statistics                      │          │
│  │  4. Determine mastery level                │          │
│  │  5. Calculate next review date             │          │
│  └───────────────────────────────────────────┘          │
└────────────────────────┼─────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Firestore                             │
│                                                           │
│  Update flashcard with:                                  │
│  • reviewCount, successCount, failCount                 │
│  • streak, currentInterval, easeFactor                   │
│  • lastReviewedAt, nextReviewAt                         │
│  • masteryLevel                                          │
└─────────────────────────────────────────────────────────┘
```

## SM-2 Spaced Repetition Algorithm

### Algorithm Overview

The **SuperMemo 2 (SM-2)** algorithm optimizes review timing based on the forgetting curve:

**Key Concepts:**

1. **Interval**: Days between reviews (increases with successful recalls)
2. **Ease Factor (EF)**: Difficulty multiplier (1.3 to 2.5+)
3. **Quality (Q)**: User's recall performance (0-5 scale)

### Quality Scoring

In FLIP, quality is simplified to binary (correct/incorrect):

```javascript
const quality = wasCorrect ? 4 : 1

// Full SM-2 scale (for reference):
// 5 = Perfect recall
// 4 = Correct after hesitation
// 3 = Correct with difficulty
// 2 = Incorrect but remembered
// 1 = Incorrect but familiar
// 0 = Complete blackout
```

### SM-2 Calculation

**Location**: `/src/lib/db/reviews.js`

```javascript
function calculateSM2(quality, currentInterval, easeFactor) {
  // 1. Calculate new ease factor
  let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  newEF = Math.max(1.3, newEF) // Floor at 1.3

  // 2. Calculate new interval
  let newInterval

  if (quality < 3) {
    // Incorrect answer: Reset to 1 day
    newInterval = 1
  } else {
    // Correct answer: Increase interval
    if (currentInterval === 0 || currentInterval === 1) {
      newInterval = 1
    } else if (currentInterval === 1) {
      newInterval = 6 // Special case: first successful recall
    } else {
      newInterval = Math.round(currentInterval * newEF)
    }
  }

  return { interval: newInterval, easeFactor: newEF }
}
```

### Interval Progression Examples

**Perfect Performance (always correct):**

```
Review 1:  +1 day   → Review on Day 1
Review 2:  +6 days  → Review on Day 7
Review 3:  +15 days → Review on Day 22
Review 4:  +37 days → Review on Day 59
Review 5:  +92 days → Review on Day 151
```

**With Mistakes:**

```
Review 1:  ✓ Correct → +1 day   (Day 1)
Review 2:  ✓ Correct → +6 days  (Day 7)
Review 3:  ✕ Wrong   → +1 day   (Day 8)  [Reset]
Review 4:  ✓ Correct → +6 days  (Day 14)
Review 5:  ✓ Correct → +15 days (Day 29)
```

## Review Statistics

### Fields Tracked

```javascript
{
  // Review metadata
  lastReviewedAt: Timestamp | null,    // When last studied
  nextReviewAt: Timestamp | null,      // When to review next

  // Performance counters
  reviewCount: number,                 // Total reviews
  successCount: number,                // Correct answers
  failCount: number,                   // Incorrect answers
  streak: number,                      // Consecutive correct

  // SRS parameters
  currentInterval: number,             // Days until next review
  easeFactor: number,                  // Difficulty multiplier (1.3-2.5+)

  // Mastery classification
  masteryLevel: 'new' | 'learning' | 'mastered'
}
```

### Initial Values (New Flashcards)

```javascript
export function getInitialReviewFields() {
  return {
    lastReviewedAt: null,
    nextReviewAt: null,
    reviewCount: 0,
    successCount: 0,
    failCount: 0,
    streak: 0,
    currentInterval: 1,
    easeFactor: 2.5, // SM-2 default
    masteryLevel: 'new',
  }
}
```

## Mastery Level System

### Classification Algorithm

**Location**: `/src/lib/db/reviews.js`

```javascript
function determineMasteryLevel(reviewCount, successCount, streak, currentInterval) {
  // Never reviewed
  if (reviewCount === 0) {
    return 'new'
  }

  const successRate = successCount / reviewCount

  // Mastered criteria:
  // • 85%+ success rate
  // • 21+ day interval (long-term retention)
  // • 5+ consecutive correct answers
  if (successRate >= 0.85 && currentInterval >= 21 && streak >= 5) {
    return 'mastered'
  }

  // Otherwise: still learning
  return 'learning'
}
```

### Mastery Badges

**Visual Indicators:**

| Level    | Emoji | Color  | Criteria                          |
| -------- | ----- | ------ | --------------------------------- |
| New      | 🆕    | Blue   | Never reviewed                    |
| Learning | 📚    | Yellow | In progress                       |
| Mastered | ✨    | Green  | 85%+ success, 21+ days, 5+ streak |

**UI Styling** (FlashcardTableView.svelte):

```css
.badge-new {
  background: rgba(59, 130, 246, 0.2); /* Blue */
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.badge-learning {
  background: rgba(245, 158, 11, 0.2); /* Yellow */
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge-mastered {
  background: rgba(16, 185, 129, 0.2); /* Green */
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}
```

## Study Flow

### User Experience Flow

```
1. Navigate to Home page

2. View flashcard (front side shown)

3. Try to recall the answer

4. Click "flip" button

5. See answer (back side shown)

6. Controls change to:
      ┌──────────────────────┐
      │  ✓ Correct  ✕ Wrong  │
      └──────────────────────┘

7. User clicks result:

   IF Correct:
     • successCount++
     • reviewCount++
     • streak++
     • Interval increases (SM-2)
     • masteryLevel may upgrade
     • nextReviewAt set to future date

   IF Wrong:
     • failCount++
     • reviewCount++
     • streak = 0 (reset)
     • Interval resets to 1 day
     • masteryLevel may downgrade
     • nextReviewAt set to tomorrow

8. Card automatically advances to next card

9. Stats update in real-time (visible in table view)
```

### Implementation

**Location**: `/src/lib/Flashcard.svelte`

```javascript
async function recordAndNext(wasCorrect) {
  if (!currentCard?.id) return
  if (isRecordingReview) return // Prevent double-click

  isRecordingReview = true

  try {
    // Update review stats in Firestore
    await updateReviewStats(currentCard.id, currentCard, wasCorrect)

    // Move to next card
    await next()
  } catch (err) {
    console.error('Failed to record review:', err)
    // Still advance even if recording fails
    await next()
  } finally {
    isRecordingReview = false
  }
}

// Button handlers
async function markCorrect() {
  await recordAndNext(true)
}

async function markIncorrect() {
  await recordAndNext(false)
}
```

## Success Rate Calculation

### Formula

```javascript
export function calculateSuccessRate(card) {
  const total = card?.reviewCount ?? 0
  const success = card?.successCount ?? 0

  if (total === 0) return 0

  return Math.round((success / total) * 100)
}
```

### Color Coding

**Location**: `/src/lib/utils/sorting.js`

```javascript
export function getSuccessRateColorClass(rate) {
  if (rate >= 90) return 'rate-excellent' // Green
  if (rate >= 70) return 'rate-good' // Yellow
  if (rate >= 50) return 'rate-fair' // Orange
  return 'rate-poor' // Red
}
```

**Visual Indicators:**

| Rate    | Class          | Color               | Meaning        |
| ------- | -------------- | ------------------- | -------------- |
| 90-100% | rate-excellent | 🟢 Green (#10b981)  | Crushing it!   |
| 70-89%  | rate-good      | 🟡 Yellow (#f59e0b) | Doing well     |
| 50-69%  | rate-fair      | 🟠 Orange (#f97316) | Needs practice |
| 0-49%   | rate-poor      | 🔴 Red (#ef4444)    | Struggling     |

## Due Date Management

### Checking Due Status

```javascript
export function isDueForReview(card) {
  if (!card) return false

  // New cards are always due
  if (!card.nextReviewAt) return true

  const now = Date.now()
  const nextReview = card.nextReviewAt?.toMillis?.() ?? 0

  return now >= nextReview
}
```

### Getting Due Cards

```javascript
export function getDueCards(cards) {
  if (!Array.isArray(cards)) return []

  return cards.filter(isDueForReview)
}
```

### Future: Due Date Filtering

**Planned features:**

- Filter study deck to only show due cards
- Prioritize overdue cards
- Schedule notifications for due reviews
- Daily review reminders

## Analytics & Metrics

### Available Metrics

**Per-Card Metrics:**

- Total reviews
- Success rate (%)
- Current streak
- Mastery level
- Next review date
- Current interval (days)

**User-Level Metrics (Future):**

- Total cards created
- Total reviews completed
- Overall success rate
- Current study streak (days)
- Cards mastered count
- Cards due today
- Average interval

### Table View Integration

**Sortable columns in FlashcardTableView:**

- Reviews (reviewCount)
- Success Rate (calculated)
- Mastery Level (visual badges)
- Date Created
- Target Vocabulary
- Translation

**Usage:**

```
Lexicon → Toggle to Table View → Sort by Success Rate (descending)
  → Identify struggling cards at top of list
  → Focus study on weak areas
```

## Data Flow: Recording a Review

```
User studies flashcard
    │
    ▼
Clicks "✓ Correct" or "✕ Wrong"
    │
    ▼
markCorrect() or markIncorrect() called
    │
    ▼
recordAndNext(wasCorrect) called
    │
    ├─→ Set isRecordingReview = true (prevent double-click)
    │
    ├─→ updateReviewStats(cardId, currentCard, wasCorrect)
    │       │
    │       └─→ calculateReviewUpdate(currentCard, wasCorrect)
    │               │
    │               ├─→ Calculate quality score (4 or 1)
    │               │
    │               ├─→ calculateSM2(quality, interval, easeFactor)
    │               │       │
    │               │       └─→ Returns: { interval, easeFactor }
    │               │
    │               ├─→ Update counts (reviewCount, successCount, etc.)
    │               │
    │               ├─→ Calculate nextReviewAt (now + interval days)
    │               │
    │               └─→ determineMasteryLevel(stats)
    │                       │
    │                       └─→ Returns: 'new' | 'learning' | 'mastered'
    │
    ├─→ Firestore updateDoc() with calculated values
    │       │
    │       └─→ onSnapshot listener fires
    │               │
    │               └─→ flashcardsStore updates
    │                       │
    │                       └─→ Table view shows new metrics
    │
    └─→ Automatically advance to next card
            │
            └─→ Set isRecordingReview = false
```

## Algorithm Tuning Parameters

### Current Configuration

```javascript
// SM-2 Parameters
const DEFAULT_EASE_FACTOR = 2.5 // Starting difficulty
const MIN_EASE_FACTOR = 1.3 // Floor for ease factor
const INITIAL_INTERVAL = 1 // First review: 1 day
const SECOND_INTERVAL = 6 // Second review: 6 days

// Mastery Thresholds
const MASTERY_SUCCESS_RATE = 0.85 // 85% success rate
const MASTERY_INTERVAL = 21 // 21+ days interval
const MASTERY_STREAK = 5 // 5 consecutive correct

// Quality Mapping
const QUALITY_CORRECT = 4 // Correct answer
const QUALITY_INCORRECT = 1 // Incorrect answer
```

### Future: Customizable Parameters

**Planned user settings:**

- Difficulty preference (adjust ease factor)
- Interval multiplier (faster/slower progression)
- Mastery thresholds
- Review reminders timing

## Performance Considerations

### Efficiency

1. **Pure Functions**: SM-2 calculations are pure (no side effects)
2. **Client-Side Computation**: No server calls for calculation
3. **Batch Operations**: Review stats updated in single Firestore write
4. **Optimistic UI**: Card advances before Firestore confirms

### Scalability

**Current limits:**

- ✅ Handles 1000+ flashcards efficiently
- ✅ Real-time updates remain performant
- ✅ No pagination needed for current use case

**Future optimizations:**

- Implement data pagination for 10,000+ cards
- Add virtual scrolling in table view
- Cache frequently accessed calculations
- Background processing for due date calculations

## Testing the Review System

### Manual Testing Checklist

Study Flow:

- [ ] Flip card to see answer
- [ ] Mark card as correct
- [ ] Mark card as incorrect
- [ ] Verify card auto-advances
- [ ] Check review count increases
- [ ] Verify success rate updates

Mastery Progression:

- [ ] New card shows "New" badge
- [ ] Review card 5+ times correctly
- [ ] Verify "Learning" badge appears
- [ ] Achieve 85%+ success rate, 21+ day interval, 5+ streak
- [ ] Verify "Mastered" badge appears

Interval Progression:

- [ ] First review sets interval to 1 day
- [ ] Second successful review sets to 6 days
- [ ] Subsequent reviews increase interval
- [ ] Failed review resets interval to 1 day
- [ ] Verify nextReviewAt dates are correct

Table View:

- [ ] Sort by Reviews column
- [ ] Sort by Success Rate column
- [ ] Verify color coding (green/yellow/orange/red)
- [ ] Check mastery badges display correctly
- [ ] Verify metrics update in real-time after study

## Related Documentation

- [System Overview](./00-system-overview.md)
- [Data Architecture](./01-data-architecture.md)
- [Component Architecture](./04-component-architecture.md)

## References

- **SM-2 Algorithm**: [SuperMemo Documentation](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
- **Forgetting Curve**: Ebbinghaus's research on memory retention
- **Spaced Repetition**: Cognitive science research on optimal review timing

---

**Last Updated**: 2025-09-30  
**Version**: 2.0 (Post-Phase 2 Implementation)
