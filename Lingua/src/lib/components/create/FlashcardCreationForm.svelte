<script lang="ts">
  // Flashcard Creation Form — follows documentation in documentation/modals/flashcard-creation-form-design-layout.md
  // Emits submit/import via function props for parent control

  type SubmitPayload = {
    target: string
    native: string
    partOfSpeech: string
    tags: string[]
    decks: string[]
  }

  let {
    onSubmit = (_data: SubmitPayload) => {},
    onImport = () => {},
  }: {
    onSubmit?: (data: SubmitPayload) => void
    onImport?: () => void
  } = $props()

  // Left column
  let target = $state('')
  let native = $state('')

  // Right column
  let partOfSpeech = $state<'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase' | 'grammar' | 'other'>('noun')

  // Tags & Decks
  let tagInput = $state('')
  let deckInput = $state('')
  let selectedTags = $state<string[]>([])
  let selectedDecks = $state<string[]>([])

  let tagSuggestions = $state<string[]>([])
  let deckSuggestions = $state<string[]>([])

  function loadSuggestions() {
    try {
      const t = JSON.parse(localStorage.getItem('recentTags') || '[]')
      const d = JSON.parse(localStorage.getItem('recentDecks') || '[]')
      if (Array.isArray(t)) tagSuggestions = t.filter(Boolean)
      if (Array.isArray(d)) deckSuggestions = d.filter(Boolean)
    } catch {}
  }

  function saveRecents(kind: 'tag' | 'deck', value: string) {
    const key = kind === 'tag' ? 'recentTags' : 'recentDecks'
    try {
      const arr = JSON.parse(localStorage.getItem(key) || '[]')
      const set = new Set<string>(Array.isArray(arr) ? arr : [])
      set.delete(value)
      set.add(value)
      const next = Array.from(set).slice(-12)
      localStorage.setItem(key, JSON.stringify(next))
      loadSuggestions()
    } catch {}
  }

  $effect(() => { loadSuggestions() })

  function normalizeName(s: string) {
    return s.trim()
  }

  function addUnique(list: string[], value: string): string[] {
    const v = normalizeName(value)
    if (!v) return list
    if (list.some(x => x.toLowerCase() === v.toLowerCase())) return list
    return [...list, v]
  }

  function removeAt(list: string[], index: number): string[] {
    return list.filter((_, i) => i !== index)
  }

  function recommended(matches: string[], input: string): string | null {
    const v = input.trim().toLowerCase()
    if (!v) return null
    const m = matches.find(x => x.toLowerCase().startsWith(v))
    return m ?? null
  }

  function handleTagKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (!tagInput.trim()) return
      const rec = recommended(filteredTagSuggestions, tagInput)
      const value = rec ?? tagInput
      selectedTags = addUnique(selectedTags, value)
      saveRecents('tag', normalizeName(value))
      tagInput = ''
    } else if (e.key === 'Tab') {
      const rec = recommended(filteredTagSuggestions, tagInput)
      if (rec) {
        e.preventDefault()
        tagInput = rec
      }
    }
  }

  function handleDeckKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (!deckInput.trim()) return
      const rec = recommended(filteredDeckSuggestions, deckInput)
      const value = rec ?? deckInput
      selectedDecks = addUnique(selectedDecks, value)
      saveRecents('deck', normalizeName(value))
      deckInput = ''
    } else if (e.key === 'Tab') {
      const rec = recommended(filteredDeckSuggestions, deckInput)
      if (rec) {
        e.preventDefault()
        deckInput = rec
      }
    }
  }

  const filteredTagSuggestions = $derived(tagInput.trim()
    ? tagSuggestions.filter(t => t.toLowerCase().includes(tagInput.trim().toLowerCase()))
    : tagSuggestions)

  const filteredDeckSuggestions = $derived(deckInput.trim()
    ? deckSuggestions.filter(t => t.toLowerCase().includes(deckInput.trim().toLowerCase()))
    : deckSuggestions)

  function submitForm() {
    const data: SubmitPayload = {
      target: target.trim(),
      native: native.trim(),
      partOfSpeech,
      tags: selectedTags,
      decks: selectedDecks,
    }
    onSubmit(data)
  }
</script>

<form class="fc-form" onsubmit={(e) => { e.preventDefault(); submitForm(); }}>
  <div class="form-grid">
    <div class="col col-left">
      <div class="row">
        <label for="target">Target language</label>
        <input id="target" name="target" type="text" bind:value={target} placeholder="안녕하세요" />
      </div>
      <div class="row">
        <label for="native">Native language</label>
        <input id="native" name="native" type="text" bind:value={native} placeholder="hello" />
      </div>
    </div>

    <div class="col col-right">
      <div class="row">
        <label for="pos">Part of speech</label>
        <select id="pos" aria-label="Part of speech" bind:value={partOfSpeech}>
          <option value="noun">Noun</option>
          <option value="verb">Verb</option>
          <option value="adjective">Adjective</option>
          <option value="adverb">Adverb</option>
          <option value="phrase">Phrase</option>
          <option value="grammar">Grammar</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div class="row">
        <label for="tags">Tags</label>
        <input id="tags" name="tags" type="text" bind:value={tagInput} onkeydown={handleTagKeydown} placeholder="Type a tag and press Enter" />
        <div class="hint" aria-live="polite">
          {#if tagInput}
            {#if recommended(filteredTagSuggestions, tagInput)}
              Tab to accept “{recommended(filteredTagSuggestions, tagInput)}”. Enter to add.
            {:else}
              Enter to create “{tagInput}”.
            {/if}
          {/if}
        </div>
        {#if selectedTags.length}
          <div class="selected-tags">
            {#each selectedTags as tag, i}
              <span class="pill">{tag}<button type="button" class="remove" aria-label={`Remove ${tag}`} onclick={() => (selectedTags = removeAt(selectedTags, i))}>×</button></span>
            {/each}
          </div>
        {/if}
        {#if filteredTagSuggestions.length}
          <div class="sugs">
            <div class="sugs-title">Suggested</div>
            <div class="sugs-list">
              {#each filteredTagSuggestions as s}
                <button type="button" class="sug" onclick={() => { selectedTags = addUnique(selectedTags, s); saveRecents('tag', s) }}>{s}</button>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <div class="row">
        <label for="decks">Decks</label>
        <input id="decks" name="decks" type="text" bind:value={deckInput} onkeydown={handleDeckKeydown} placeholder="Type a deck and press Enter" />
        <div class="hint" aria-live="polite">
          {#if deckInput}
            {#if recommended(filteredDeckSuggestions, deckInput)}
              Tab to accept “{recommended(filteredDeckSuggestions, deckInput)}”. Enter to add.
            {:else}
              Enter to create “{deckInput}”.
            {/if}
          {/if}
        </div>
        {#if selectedDecks.length}
          <div class="selected-tags">
            {#each selectedDecks as deck, i}
              <span class="pill">{deck}<button type="button" class="remove" aria-label={`Remove ${deck}`} onclick={() => (selectedDecks = removeAt(selectedDecks, i))}>×</button></span>
            {/each}
          </div>
        {/if}
        {#if filteredDeckSuggestions.length}
          <div class="sugs">
            <div class="sugs-title">Suggested</div>
            <div class="sugs-list">
              {#each filteredDeckSuggestions as s}
                <button type="button" class="sug" onclick={() => { selectedDecks = addUnique(selectedDecks, s); saveRecents('deck', s) }}>{s}</button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <div class="actions">
    <button class="btn secondary" type="button" onclick={onImport}>Import</button>
    <button class="btn primary" type="submit">Create</button>
  </div>
</form>

<style>
  .fc-form { display: flex; flex-direction: column; gap: 1rem; }
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  @media (max-width: 900px) {
    .form-grid { grid-template-columns: 1fr; }
  }
  .col { display: flex; flex-direction: column; gap: 0.75rem; }
  .row { display: flex; flex-direction: column; gap: 0.35rem; }

  label { color: #eeeeee; font-size: 0.95rem; }
  input, select {
    background: #31363f;
    color: #76abae;
    border: 1px solid #31363f;
    border-radius: 8px;
    padding: 0.5rem 0.6rem;
    outline: none;
  }
  input::placeholder { color: rgba(238,238,238,0.6); }
  input:focus, select:focus { border-color: #76abae; box-shadow: 0 0 0 2px #76abae22; }

  .hint { font-size: 0.8rem; color: rgba(238,238,238,0.8); min-height: 1.1rem; }

  .selected-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.25rem; }
  .pill { background: rgba(118,171,174, 1); color: #222831; border-radius: 999px; padding: 0.2rem 0.5rem; display: inline-flex; align-items: center; gap: 0.35rem; }
  .pill .remove { background: transparent; border: none; color: inherit; cursor: pointer; padding: 0; font-size: 0.9rem; }

  .sugs { margin-top: 0.25rem; display: flex; flex-direction: column; gap: 0.25rem; }
  .sugs-title { font-size: 0.8rem; opacity: 0.85; color: #eeeeee; }
  .sugs-list { display: flex; flex-wrap: wrap; gap: 0.35rem; }
  .sug { background: transparent; border: 1px solid #415780; color: #eeeeee; border-radius: 999px; padding: 0.2rem 0.5rem; cursor: pointer; }
  .sug:hover, .sug:focus-visible { background: rgba(65, 87, 128, 0.25); outline: none; }

  .actions {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 0.25rem;
  }
  .btn { background: transparent; border: 1px solid #415780; color: #eeeeee; border-radius: 8px; padding: 0.5rem 0.9rem; cursor: pointer; }
  .btn.primary { border-color: #76abae; }
  .btn.secondary { border-color: #415780; }
  .btn:hover, .btn:focus-visible { background: rgba(65, 87, 128, 0.25); outline: none; }
</style>


