<script lang="ts">
  import NavigationBar from './NavigationBar.svelte'
  import { isLoggedIn, user as authUser } from './stores/auth'
  import { claimUsername, setProfileDetails } from './services/userService'
  import SentenceLibraryModal from './SentenceLibraryModal.svelte'
  import DeckLibraryModal from './DeckLibraryModal.svelte'
  import SettingsModal from './SettingsModal.svelte'
  import ProfileModal from './ProfileModal.svelte'

  let firstName = $state('')
  let lastName = $state('')
  let username = $state('')
  let isSubmitting = $state(false)
  let errorMessage = $state<string | null>(null)
  let successMessage = $state<string | null>(null)
  let showSentenceLibrary = $state(false)
  let showDeckLibrary = $state(false)
  let showSettings = $state(false)
  let showProfile = $state(false)

$effect(() => {
  const displayName = $authUser?.displayName?.trim() ?? ''
  if (!displayName) return
  if (!username) {
    username = displayName
  }
})

async function handleSave(e: Event) {
  e.preventDefault()
  errorMessage = null
  successMessage = null
  isSubmitting = true
  try {
    await setProfileDetails({
      firstName,
      lastName,
    })
    if (username && username.trim()) {
      // Reserve and sync Auth displayName to username
      await claimUsername(username.trim())
    }
    successMessage = 'Saved.'
  } catch (caught: unknown) {
    console.error('Failed to save profile', caught)
    errorMessage =
      caught instanceof Error ? caught.message : 'Failed to save profile.'
  } finally {
    isSubmitting = false
  }
}
</script>

<NavigationBar
  onOpenSentences={() => (showSentenceLibrary = true)}
  onOpenDecks={() => (showDeckLibrary = true)}
  onOpenSettings={() => (showSettings = true)}
/>

<main class="profile-page">
  <section class="card" aria-labelledby="profile-title">
    <h1 id="profile-title">Profile Page</h1>

    {#if $isLoggedIn}
      {#if errorMessage}
        <div class="error" role="alert">{errorMessage}</div>
      {/if}
      {#if successMessage}
        <div class="success" role="status">{successMessage}</div>
      {/if}

      <form class="profile-form" onsubmit={handleSave}>
        <div class="row-2col">
          <div>
            <label for="first-name">First name</label>
            <input
              id="first-name"
              type="text"
              placeholder="First name"
              bind:value={firstName}
              autocomplete="given-name"
            />
          </div>
          <div>
            <label for="last-name">Last name</label>
            <input
              id="last-name"
              type="text"
              placeholder="Last name"
              bind:value={lastName}
              autocomplete="family-name"
            />
          </div>
        </div>

        <label for="username">Username</label>
        <input
          id="username"
          type="text"
          placeholder="your_username"
          bind:value={username}
          autocomplete="username"
          spellcheck={false}
        />
        <div class="helper">Must be unique (a–z, 0–9, _). Saves will set your display name.</div>

        <button class="save" type="submit" disabled={isSubmitting}
          >{isSubmitting ? 'Saving…' : 'Save profile'}</button
        >
      </form>
    {/if}
  </section>
</main>

<SentenceLibraryModal open={showSentenceLibrary} onClose={() => (showSentenceLibrary = false)} />
<DeckLibraryModal open={showDeckLibrary} onClose={() => (showDeckLibrary = false)} />
<SettingsModal open={showSettings} onClose={() => (showSettings = false)} />
<ProfileModal open={showProfile} onClose={() => (showProfile = false)} />

<style>
  .profile-page {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 1.5rem 1rem;
    padding-top: calc(56px + 1.5rem);
    background-color: #222831;
  }

  .card {
    width: 100%;
    max-width: 640px;
    background-color: #31363f;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    color: #eeeeee;
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #eeeeee;
  }

  .profile-form {
    display: grid;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .row-2col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  label {
    font-size: 0.9rem;
    color: #eeeeee;
  }

  input[type='text'] {
    width: 100%;
    background: #2a2f38;
    color: #eeeeee;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 0.625rem 0.75rem;
    outline: none;
    transition:
      box-shadow 0.2s,
      border-color 0.2s;
  }

  input[type='text']:focus {
    border-color: #76abae;
    box-shadow: 0 0 0 2px #76abae33;
  }

  .helper {
    margin-top: -0.25rem;
    margin-bottom: 0.25rem;
    font-size: 0.85rem;
    color: #d8d8d8;
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

  .save:hover:enabled {
    filter: brightness(1.06);
  }
  .save:disabled {
    opacity: 0.7;
    cursor: default;
  }
</style>
