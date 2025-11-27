<script lang="ts">
  import { posChipFormat } from '$lib/stores/settings'
  import SettingsIcon from '$lib/icons/Settings.svelte'
  import ProfileIcon from '$lib/icons/ProfileIcon.svelte'
  import LoginIcon from '$lib/icons/Login.svelte'
  import { isLoggedIn, logout } from '$lib/stores/auth'
  import {
    claimUsername,
    getProfileDetails,
    getUsername,
    setProfileDetails,
  } from '$lib/services/userService'
  type IconComponent = typeof SettingsIcon

  type SettingsSection = 'general' | 'profile'
  type SectionConfig = {
    id: SettingsSection
    label: string
    description: string
    icon: IconComponent
  }

  const sections: SectionConfig[] = [
    {
 id: 'general', label: 'General', description: 'Appearance & helpers', icon: SettingsIcon 
},
    {
 id: 'profile', label: 'Profile', description: 'Name & username', icon: ProfileIcon 
},
  ]

let {
  open,
  onClose = () => {},
}: {
  open: boolean
  onClose?: () => void
} = $props()

  let activeSection: SettingsSection = $state('general')

  // Local-only demo settings; wire to real stores later
  let colorScheme: 'system' | 'dark' | 'light' = $state('system')
  let reduceMotion: boolean = $state(false)
  let showTips: boolean = $state(true)

  // Profile state
  let firstName: string = $state('')
  let lastName: string = $state('')
  let username: string = $state('')
  let initialUsername: string = $state('')
  let originalFirstName = ''
  let originalLastName = ''
  let originalUsername = ''
  let profileLoading: boolean = $state(false)
  let isEditingProfile: boolean = $state(false)
  let isSavingProfile: boolean = $state(false)
  let profileSuccess: string | null = $state(null)
  let profileError: string | null = $state(null)

  let isLoggingOut: boolean = $state(false)
  let logoutError: string | null = $state(null)

  async function hydrateProfileFields() {
    profileError = null
    if (!$isLoggedIn) {
      profileLoading = false
      firstName = ''
      lastName = ''
      username = ''
      initialUsername = ''
      originalFirstName = ''
      originalLastName = ''
      originalUsername = ''
      return
    }
    profileLoading = true
    profileSuccess = null
    try {
      const [u, details] = await Promise.all([getUsername(), getProfileDetails()])
      const normalizedUsername = (u ?? '').trim()
      const resolvedUsername = normalizedUsername === 'Anonymous' ? '' : normalizedUsername
      initialUsername = resolvedUsername
      originalUsername = resolvedUsername
      username = resolvedUsername

      const first = (details?.firstName ?? '').trim()
      const last = (details?.lastName ?? '').trim()
      firstName = first
      lastName = last
      originalFirstName = first
      originalLastName = last
    } catch (err) {
      console.error('[SettingsModal] Failed to load profile details', err)
      profileError = 'Unable to load profile details.'
    } finally {
      profileLoading = false
    }
  }

  $effect(() => {
    if (!open) {
      isEditingProfile = false
      return
    }
    activeSection = 'general'
    isLoggingOut = false
    logoutError = null
    hydrateProfileFields()
  })

  function handleSectionSelect(section: SettingsSection) {
    activeSection = section
  }

  function cancelProfileEdit() {
    isEditingProfile = false
    profileError = null
    profileSuccess = null
    firstName = originalFirstName
    lastName = originalLastName
    username = originalUsername
  }

  async function handleSaveProfile(e?: Event) {
    e?.preventDefault()
    if (!$isLoggedIn) {
      profileError = 'Please log in to edit your profile.'
      return
    }
    isSavingProfile = true
    profileSuccess = null
    profileError = null
    try {
      await setProfileDetails({
 firstName, lastName 
})
      const nextUsername = (username ?? '').trim()
      if (nextUsername && nextUsername !== initialUsername) {
        await claimUsername(nextUsername)
        initialUsername = nextUsername
      }
      originalFirstName = firstName
      originalLastName = lastName
      originalUsername = username
      profileSuccess = 'Saved.'
      isEditingProfile = false
    } catch (caught: unknown) {
      console.error('Failed to save profile from settings modal', caught)
      profileError =
        caught instanceof Error ? caught.message : 'Failed to save.'
    } finally {
      isSavingProfile = false
    }
  }

  async function handleLogout() {
    if (!$isLoggedIn || isLoggingOut) {
      if (!$isLoggedIn) {
        onClose()
      }
      return
    }
    isLoggingOut = true
    logoutError = null
    try {
      await logout()
      onClose()
    } catch (err) {
      console.error('[SettingsModal] Failed to log out', err)
      logoutError = 'Unable to log out. Please try again.'
    } finally {
      isLoggingOut = false
    }
  }
</script>

{#if open}
  <div
    class="modal-backdrop"
    role="presentation"
    tabindex="-1"
    onclick={() => onClose()}
    onkeydown={e => {
      if (e.key === 'Escape') onClose()
    }}
  >
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
      tabindex="-1"
      onclick={e => e.stopPropagation()}
      onkeydown={e => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <div class="modal-header">
        <h2 class="modal-title">Settings</h2>
        <button class="close-button" type="button" aria-label="Close" onclick={() => onClose()}
          >✕</button
        >
      </div>

      <div class="modal-grid" role="group" aria-label="Settings split view">
        <aside class="left-pane">
          <h3 class="left-title">Sections</h3>
          <ul class="section-list" role="tablist" aria-label="Settings sections">
          {#each sections as section (section.id)}
              {@const Icon = section.icon}
              <li>
                <button
                  type="button"
                  class="section-item"
                  class:active={activeSection === section.id}
                  role="tab"
                  aria-selected={activeSection === section.id}
                  id={`${section.id}-tab`}
                  aria-controls={`${section.id}-panel`}
                  onclick={() => handleSectionSelect(section.id)}
                >
                  <Icon size={18} stroke="#76abae" strokeWidth={1.5} />
                  <div class="section-text">
                    <span class="title">{section.label}</span>
                    <span class="description">{section.description}</span>
                  </div>
                </button>
              </li>
            {/each}
          </ul>
          <div class="section-divider" role="presentation"></div>
          <button
            type="button"
            class="section-logout"
            onclick={handleLogout}
            disabled={isLoggingOut || !$isLoggedIn}
            aria-busy={isLoggingOut}
          >
            <LoginIcon size={18} stroke="#eeeeee" strokeWidth={1.5} ariaLabel="Logout" />
            <span>{isLoggingOut ? 'Logging out…' : 'Log out'}</span>
          </button>
          {#if logoutError}
            <p class="error-text" role="alert">{logoutError}</p>
          {/if}
          {#if !$isLoggedIn}
            <p class="hint muted">Sign in to save sentences, decks, and flashcards.</p>
          {/if}
        </aside>

        <div
          class="right-pane"
          role="tabpanel"
          aria-labelledby={`${activeSection}-tab`}
          id={`${activeSection}-panel`}
        >
          {#if activeSection === 'general'}
            <div class="section-content">
              <div class="card">
                <h4>Appearance</h4>
                <div class="row">
                  <label for="scheme">Color scheme</label>
                  <select id="scheme" bind:value={colorScheme} aria-label="Color scheme">
                    <option value="system">System</option>
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
                <p class="hint">UI adapts to your system theme by default.</p>
              </div>

              <div class="card">
                <h4>Parsing display</h4>
                <div class="row">
                  <label for="pos-format">POS chip format</label>
                  <select id="pos-format" bind:value={$posChipFormat} aria-label="POS chip format">
                    <option value="short">Short (N, V, Adj)</option>
                    <option value="full">Full (noun, verb, adjective)</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
                <p class="hint">Choose how part of speech chips appear in parsing mode.</p>
              </div>

              <div class="card">
                <h4>Guidance</h4>
                <div class="switch-group">
                  <label class="switch">
                    <input type="checkbox" bind:checked={reduceMotion} />
                    <span>Reduce motion</span>
                  </label>
                  <p class="hint">Prefer subtler animations throughout the app.</p>

                  <label class="switch">
                    <input type="checkbox" bind:checked={showTips} />
                    <span>Show tips and hints</span>
                  </label>
                  <p class="hint">Surface inline guidance in parsing and flashcard flows.</p>
                </div>
              </div>
            </div>
          {:else}
            <div class="section-content">
              {#if !$isLoggedIn}
                <div class="state muted">Log in to manage your profile.</div>
              {:else if profileLoading}
                <div class="state">Loading profile…</div>
              {:else}
                {#if profileError}
                  <div class="error" role="alert">{profileError}</div>
                {/if}
                {#if profileSuccess}
                  <div class="success" role="status">{profileSuccess}</div>
                {/if}

                <form class="profile-form" onsubmit={handleSaveProfile}>
                  {#if isEditingProfile}
                    <div class="row-2col">
                      <div class="form-field">
                        <label for="settings-first-name">First name</label>
                        <input
                          id="settings-first-name"
                          type="text"
                          placeholder="First name"
                          bind:value={firstName}
                          autocomplete="given-name"
                        />
                      </div>
                      <div class="form-field">
                        <label for="settings-last-name">Last name</label>
                        <input
                          id="settings-last-name"
                          type="text"
                          placeholder="Last name"
                          bind:value={lastName}
                          autocomplete="family-name"
                        />
                      </div>
                    </div>

                    <div class="form-field">
                      <label for="settings-username">Username</label>
                      <input
                        id="settings-username"
                        type="text"
                        placeholder="your_username"
                        bind:value={username}
                        autocomplete="username"
                        spellcheck={false}
                      />
                      <p class="helper">Must be unique (a–z, 0–9, _). Updates your display name.</p>
                    </div>
                  {:else}
                    <div class="row-2col">
                      <div class="info-block">
                        <p class="field-label">First name</p>
                        <div class="display-field">{firstName || '—'}</div>
                      </div>
                      <div class="info-block">
                        <p class="field-label">Last name</p>
                        <div class="display-field">{lastName || '—'}</div>
                      </div>
                    </div>

                    <div class="info-block">
                      <p class="field-label">Username</p>
                      <div class="display-field">{username || '—'}</div>
                    </div>
                  {/if}

                  <div class="form-actions">
                    {#if isEditingProfile}
                      <button type="submit" class="primary" disabled={isSavingProfile}>
                        {isSavingProfile ? 'Saving…' : 'Save'}
                      </button>
                      <button type="button" onclick={cancelProfileEdit} disabled={isSavingProfile}
                        >Cancel</button
                      >
                    {:else}
                      <button
                        type="button"
                        class="primary"
                        onclick={() => (isEditingProfile = true)}>Edit</button
                      >
                    {/if}
                  </div>
                </form>
              {/if}
            </div>
          {/if}
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="primary" onclick={() => onClose()}>Close</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
  }

  .modal {
    background: #31363f;
    color: #eeeeee;
    width: min(960px, 92vw);
    max-height: 80vh;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .modal-title {
    margin: 0;
    font-size: 1.1rem;
  }
  .close-button {
    background: transparent;
    border: 1px solid #76abae;
    color: #eeeeee;
    cursor: pointer;
    border-radius: 6px;
    padding: 0.25rem 0.5rem;
  }

  .modal-grid {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 1rem;
    min-height: 360px;
    overflow: hidden;
  }

  .left-pane {
    background: #2b3038;
    border-radius: 8px;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .left-title {
    margin: 0;
    font-size: 1rem;
  }

  .section-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .section-divider {
    width: 100%;
    height: 1px;
    background: rgba(238, 238, 238, 0.12);
    margin: 0.5rem 0 0.75rem;
  }

  .section-item {
    width: 100%;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    background: transparent;
    border: 1px solid rgba(238, 238, 238, 0.12);
    border-radius: 0.5rem;
    padding: 0.5rem;
    color: #eeeeee;
    cursor: pointer;
    transition:
      background-color 0.2s,
      border-color 0.2s;
    text-align: left;
  }

  .section-item.active {
    background: rgba(118, 171, 174, 0.15);
    border-color: #76abae;
  }

  .section-item:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px #76abae66;
  }

  .section-text {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }
  .section-text .title {
    font-size: 0.95rem;
    line-height: 1.2;
  }
  .section-text .description {
    font-size: 0.75rem;
    opacity: 0.7;
  }

  .section-logout {
    width: 100%;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
    border: 1px solid rgba(238, 238, 238, 0.12);
    border-radius: 0.5rem;
    padding: 0.45rem 0.55rem;
    color: #eeeeee;
    cursor: pointer;
    transition:
      background-color 0.2s,
      border-color 0.2s;
  }
  .section-logout:hover:not(:disabled),
  .section-logout:focus-visible:not(:disabled) {
    background: rgba(118, 171, 174, 0.15);
    border-color: #76abae;
    outline: none;
  }
  .section-logout:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .right-pane {
    background: #2b3038;
    border-radius: 8px;
    padding: 0.75rem;
    overflow: hidden;
  }

  .section-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
    overflow: auto;
  }

  .card {
    background: #22262d;
    border-radius: 0.75rem;
    padding: 0.85rem 0.95rem;
    border: 1px solid rgba(238, 238, 238, 0.08);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .card h4 {
    margin: 0;
    font-size: 1rem;
  }

  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    align-items: center;
  }

  @media (max-width: 720px) {
    .modal-grid {
      grid-template-columns: 1fr;
    }
    .row {
      grid-template-columns: 1fr;
    }
  }

  label {
    font-size: 0.95rem;
  }

  select,
  input[type='text'] {
    width: 100%;
    background: #22262d;
    color: #eeeeee;
    border: 1px solid rgba(238, 238, 238, 0.12);
    border-radius: 8px;
    padding: 0.5rem 0.6rem;
    outline: none;
  }
  select:focus,
  input[type='text']:focus {
    border-color: #76abae;
    box-shadow: 0 0 0 2px #76abae33;
  }

  .switch-group {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .switch {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    user-select: none;
  }
  .switch input {
    accent-color: #76abae;
  }

  .hint {
    margin: 0;
    opacity: 0.85;
    font-size: 0.85rem;
  }
  .hint.muted {
    opacity: 0.65;
  }

  .state {
    padding: 1rem;
    text-align: center;
    color: #eeeeee;
    background: rgba(118, 171, 174, 0.08);
    border-radius: 0.5rem;
  }
  .state.muted {
    background: transparent;
    opacity: 0.8;
  }

  .profile-form {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .row-2col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .info-block {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .field-label {
    margin: 0;
    font-size: 0.85rem;
    opacity: 0.85;
  }

  .display-field {
    width: 100%;
    background: #1c2027;
    color: #eeeeee;
    border: 1px solid rgba(238, 238, 238, 0.12);
    border-radius: 8px;
    padding: 0.55rem 0.65rem;
  }

  .helper {
    margin: -0.2rem 0 0;
    font-size: 0.8rem;
    color: #d8d8d8;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .error {
    background: rgba(220, 53, 69, 0.15);
    border: 1px solid rgba(220, 53, 69, 0.35);
    color: #ffb3b8;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    font-size: 0.9rem;
  }

  .success {
    background: rgba(118, 171, 174, 0.15);
    border: 1px solid rgba(118, 171, 174, 0.35);
    color: #cce7e8;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    font-size: 0.9rem;
  }

  .error-text {
    color: #ffb3b8;
    margin: 0.5rem 0 0;
    font-size: 0.85rem;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(238, 238, 238, 0.08);
    margin-top: 0.5rem;
  }

  .primary {
    background: transparent;
    border: 1px solid #76abae;
    color: #eeeeee;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
  }
  .primary:hover {
    background: rgba(118, 171, 174, 0.15);
  }

  .form-actions button:not(.primary) {
    background: transparent;
    border: 1px solid #76abae;
    color: #eeeeee;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
  }
  .form-actions button:not(.primary):hover {
    background: rgba(118, 171, 174, 0.15);
  }
</style>
