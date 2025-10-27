<script lang="ts">
  let targetLanguage: string = ''
  let nativeLanguage: string = ''

  function handleSubmit() {
    // Placeholder submit handler per § 4.2.1
    console.log('Create submit:', { targetLanguage, nativeLanguage })
  }
</script>

<main class="create">
  <section class="create-card" aria-labelledby="create-title">
    <h1 id="create-title" class="create-title">Create</h1>
    <div class="create-grid">
      <form class="create-form" on:submit|preventDefault={handleSubmit}>
        <div class="grid-2">
          <div class="field">
            <label for="target" class="field-label">Target language</label>
            <input
              id="target"
              name="target"
              type="text"
              bind:value={targetLanguage}
              placeholder="안녕하세요"
              class="text-input"
              required
            />
          </div>
          <div class="field">
            <label for="native" class="field-label">Native translation</label>
            <input
              id="native"
              name="native"
              type="text"
              bind:value={nativeLanguage}
              placeholder="hello"
              class="text-input"
              required
            />
          </div>
        </div>
        <div class="actions">
          <button type="button">import</button>
          <button type="submit">submit</button>
        </div>
      </form>

      <aside class="tags" aria-labelledby="tags-title">
        <h2 id="tags-title" class="tags-title">tags</h2>
        <p class="tags-placeholder">#text</p>
      </aside>
    </div>
  </section>
  </main>

<style>
  .create {
    display: grid;
    place-items: center;
    padding: 2rem 1rem;
  }
  .create-card {
    width: 100%;
    max-width: 960px;
    background-color: #31363F; /* § 3.1 Section/Div Backgrounds */
    border-radius: 12px;
    padding: 1.25rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  }
  .create-title {
    margin: 0 0 1rem 0;
    color: #EEEEEE; /* § 3.1 Secondary Text */
    font-size: 1.25rem;
    font-weight: 600;
  }
  .create-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1rem;
  }
  .create-form {
    display: grid;
    gap: 1rem;
  }
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  .field {
    display: grid;
    gap: 0.4rem;
  }
  .field-label {
    color: #EEEEEE;
    font-size: 0.9rem;
  }
  .text-input {
    padding: 0.6rem 0.75rem;
    border-radius: 8px;
    border: 1px solid transparent;
    background-color: #31363F;
    color: #EEEEEE;
    outline: none;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);
  }
  .text-input::placeholder {
    color: #EEEEEE;
    opacity: 0.6;
  }
  .text-input:focus {
    box-shadow: inset 0 0 0 2px #415780; /* § 3.1 Button Hover as focus ring */
  }
  .actions {
    display: flex;
    gap: 0.5rem;
  }
  .tags {
    background-color: #31363F;
    border-radius: 8px;
    padding: 0.75rem;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
    align-self: start;
  }
  .tags-title {
    margin: 0 0 0.5rem 0;
    color: #EEEEEE;
    font-size: 1rem;
    font-weight: 600;
  }
  .tags-placeholder {
    margin: 0;
    color: #76ABAE; /* § 3.1 Primary Text */
  }

  @media (max-width: 768px) {
    .create-grid {
      grid-template-columns: 1fr;
    }
    .grid-2 {
      grid-template-columns: 1fr;
    }
  }
</style>

