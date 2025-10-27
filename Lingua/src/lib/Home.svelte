<script lang="ts">
  let entry: string = ''

  function handleSubmit() {
    console.log('Submitted:', entry)
  }
</script>

<main class="home">
  <section class="home-card" aria-labelledby="home-title">
    <h1 id="home-title" class="home-title">Practice</h1>
    <form class="home-form" on:submit|preventDefault={handleSubmit}>
      <label class="field-label" for="entry">Enter text</label>
      <div class="form-row">
        <input
          id="entry"
          name="entry"
          type="text"
          bind:value={entry}
          placeholder="Type here..."
          aria-label="Text entry"
          class="text-input"
          required
        />
        <button type="submit" class="submit-btn">submit</button>
      </div>
    </form>
  </section>
</main>

<style>
  .home {
    display: grid;
    place-items: center;
    padding: 2rem 1rem;
  }
  .home-card {
    width: 100%;
    max-width: 640px;
    background-color: #31363F;
    border-radius: 12px;
    padding: 1.25rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  }
  .home-title {
    margin: 0 0 1rem 0;
    color: #EEEEEE;
    font-size: 1.25rem;
    font-weight: 600;
  }
  .home-form {
    display: grid;
    gap: 0.5rem;
  }
  .field-label {
    color: #EEEEEE;
    font-size: 0.9rem;
  }
  .form-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .text-input {
    flex: 1 1 auto;
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
    box-shadow: inset 0 0 0 2px #415780;
  }
  .submit-btn {
    white-space: nowrap;
  }
</style>

