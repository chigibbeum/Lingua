<script lang="ts">
  import { claimUsername, setUsername } from '../services/userService'
  import { user as authUser, isLoggedIn } from '../stores/auth'

  let { requireUnique = true }: { requireUnique?: boolean } = $props()

  let username = $state('')
  let isSubmitting = $state(false)
  let errorMessage = $state<string | null>(null)
  let successMessage = $state<string | null>(null)

  $effect(() => {
    username = $authUser?.displayName ?? ''
  })

  async function handleSubmit(e: Event) {
    e.preventDefault()
    errorMessage = null
    successMessage = null
    if (!username.trim()) {
      errorMessage = 'Username required.'
      return
    }
    isSubmitting = true
    try {
      if (requireUnique) {
        await claimUsername(username)
      } else {
        await setUsername(username)
      }
      successMessage = 'Saved.'
    } catch (err: any) {
      const msg = (err && err.message) ? String(err.message) : 'Failed to save username.'
      errorMessage = msg
    } finally {
      isSubmitting = false
    }
  }
</script>

{#if $isLoggedIn}
  <section class="username-card" aria-labelledby="username-title">
    <h2 id="username-title">Choose a username</h2>
    <p class="hint">Usernames are 3–20 characters: letters, numbers, or underscore.</p>

    {#if errorMessage}
      <div class="error" role="alert">{errorMessage}</div>
    {/if}
    {#if successMessage}
      <div class="success" role="status">{successMessage}</div>
    {/if}

    <form class="form" onsubmit={handleSubmit}>
      <div class="row">
        <input
          class="input"
          type="text"
          placeholder="your_username"
          bind:value={username}
          autocomplete="username"
          spellcheck={false}
          aria-label="Username"
        />
        <button class="save" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  </section>
{/if}

<style>
  .username-card {
    width: 100%;
    max-width: 560px;
    background-color: #31363f;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    color: #eeeeee;
    margin: 0 auto 1rem auto;
  }

  h2 {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    color: #eeeeee;
  }

  .hint {
    margin: 0 0 0.75rem 0;
    color: #d8d8d8;
    font-size: 0.9rem;
  }

  .error {
    background: rgba(220, 53, 69, 0.15);
    border: 1px solid rgba(220, 53, 69, 0.35);
    color: #ffb3b8;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
  }

  .success {
    background: rgba(118, 171, 174, 0.15);
    border: 1px solid rgba(118, 171, 174, 0.35);
    color: #cce7e8;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
  }

  .form {
    display: grid;
    gap: 0.75rem;
  }

  .row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.5rem;
  }

  .input {
    width: 100%;
    background: #2a2f38;
    color: #eeeeee;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 0.625rem 0.75rem;
    outline: none;
    transition: box-shadow 0.2s, border-color 0.2s;
  }

  .input:focus {
    border-color: #76abae;
    box-shadow: 0 0 0 2px #76abae33;
  }

  .save {
    background: #76abae;
    color: #222831;
    border: none;
    border-radius: 8px;
    padding: 0.625rem 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: filter 0.2s;
  }

  .save:hover:enabled { filter: brightness(1.06); }
  .save:disabled { opacity: 0.7; cursor: default; }
</style>


