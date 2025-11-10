# Icon Component Usage Guidelines

## § 1.0 Overview

All icons in `/web/src/icons/` are Svelte 5 components using runes syntax. These components provide flexible, reusable icons with customizable props.

## § 2.0 Available Icons

- `Abc.svelete` - For Parsing Mode
- `AddFlashcards.svelte` - Creating flashcards either inputed by the user of or collected from sentence parsing
- `Break.svelte` - Popover command for breaking up text nodes
- `Calendar.svelte` - For filtering by date 
- `Collapse.svelte` - Used for closing the dashboard/navigation bar
- `DeckLibrary.svelte` - For opening up the library of flashcards made
- `DeleteGarbageIcon.svelte` - For actions when deleting any type of created content
- `EditNode.svelte` - Editing text in current node when using the edit function
- `EditText.svelte` - When editing text while actively parsing
- `Filter.svelte` - For any filter option, excluding by date.
- `Flashcard.svelte` - Switching to flashcard mode
- `HistoryView.svelte` - View recent changes that were made while parsing
- `HowToUse.svelete` - For the How To Use page
- `InsertRight.svelte` - Edit mode insert right option 
- `InsertLeft.svelte` - Edit mode insert left option 
- `Login.svelte` - Opens login page
- `NewText.svelte` - Starting a new sentence 
- `Open.svelte` - Use for opening the dashbard/navigation bar
- `ParseText.svelte` - Allows the user to parse the submitted text
- `SaveNotes.svelte` - For saving notes when in parsing mode
- `SentenceLibrary.svelte` - For opening the library of sentences made and parsed
- `Setting.svelte` - For opening the settings page
- `Sort.svelete` - For sorting actions (Might need to update this later)
- `VocabNote.svelte` - Popover command for making a vocabulary note

## § 3.0 Component Props

All icon components accept these props (defined via Svelte 5 `$props()` rune):

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `stroke` | string | `'currentColor'` | Icon stroke color |
| `fill` | string | `'none'` | Icon fill color |
| `size` | number | `24` | Width and height in pixels |
| `class` | string | `''` | Additional CSS classes |

## § 4.0 Agent Instructions

### § 4.1 When Adding Icons to Components

**MUST:**
- Import icons from the icons directory
- Use project color palette (§ 3.1) for stroke/fill colors
- Specify appropriate size based on context (16-32px typical range)
- Use `currentColor` when icons should inherit text color
- Add `class` prop for custom styling needs

**MUST NOT:**
- Hardcode icon SVG markup directly in components
- Use arbitrary colors outside the design system
- Forget to specify size for icons in different contexts

### § 4.2 Color Palette Integration

Following § 3.1 (Color Palette), use these stroke colors:

```svelte
<!-- Primary text color - for prominent icons -->
<Icon stroke="#eeeeee" />

<!-- Button color - for interactive icons -->
<Icon stroke="#31363f" />

<!-- Button hover - for hover states -->
<Icon stroke="#415780" />

<!-- Secondary text - for less prominent icons -->
<Icon stroke="#76abae" />

<!-- Inherit from parent text color -->
<Icon stroke="currentColor" />
```

### § 4.3 Import Patterns

**Preferred - Named imports from index:**
```svelte
<script>
import { Tag, Cards, SquarePlus } from '$lib/../icons';
</script>
```

**Alternative - Direct import:**
```svelte
<script>
import Tag from '$lib/../icons/Tag.svelte';
</script>
```

### § 4.4 Common Usage Examples

**Navigation buttons:**
```svelte
<button>
  <Cards stroke="#9ab0a2" size={20} />
  <span>Lexicon</span>
</button>
```

**Interactive elements with hover:**
```svelte
<style>
  .icon-button:hover :global(svg) {
    opacity: 0.8;
  }
</style>

<button class="icon-button">
  <SquarePlus stroke="#f0e4e4" size={24} />
</button>
```

**Context-aware sizing:**
```svelte
<!-- Mobile/compact -->
<Tag stroke="currentColor" size={16} />

<!-- Standard UI -->
<Tag stroke="currentColor" size={20} />

<!-- Prominent display -->
<Tag stroke="currentColor" size={32} />
```

**With custom classes:**
```svelte
<AdjustmentsHorizontal 
  stroke="#9ab0a2" 
  size={24} 
  class="settings-icon animate-spin"
/>
```

## § 5.0 Maintenance

### § 5.1 Adding New Icons

When adding new icon components:

1. Create `.svelte` file with PascalCase naming
2. Use identical prop structure: `let { stroke = 'currentColor', fill = 'none', size = 24, class: className = '' } = $props();`
3. Apply props to SVG root element
4. Export in `index.js`
5. Update § 2.0 in this guideline

### § 5.2 Modifying Existing Icons

When modifying icons:

1. Preserve the prop interface (§ 3.0)
2. Maintain Svelte 5 runes syntax
3. Test with various prop combinations
4. Verify color palette compliance (§ 4.2)

## § 6.0 Reference

These guidelines support:
- § 3.1 (Color Palette) - for color prop values
- § 4.2 (Maintainability and Design) - for component structure
- § 4.4.4 (Component Architecture) - for import patterns

