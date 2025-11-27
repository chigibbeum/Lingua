<script lang="ts">
  import {
    claimUsername,
    setProfileDetails,
    getUsername,
    getProfileDetails,
  } from '$lib/services/userService'

  let {
    open,
    onClose = () => {},
  }: {
    open: boolean
    onClose?: () => void
  } = $props()

  let firstName: string = $state('')
  let lastName: string = $state('')
  let username: string = $state('')
  let initialUsername: string = $state('')
  let isSubmitting: boolean = $state(false)
  let successMessage: string | null = $state(null)
  let errorMessage: string | null = $state(null)
  let isEditing: boolean = $state(false)

  $effect(() => {
    if (open) {
      successMessage = null
      errorMessage = null
      ;(async () => {
        try {
          const [u, details] = await Promise.all([getUsername(), getProfileDetails()])
          const normalized = (u ?? '').trim()
          const nextUsername = normalized === 'Anonymous' ? '' : normalized
          if (nextUsername) {
            initialUsername = nextUsername
            username = nextUsername
          }
          if (details?.firstName !== undefined) firstName = (details.firstName ?? '').trim()
          if (details?.lastName !== undefined) lastName = (details.lastName ?? '').trim()
        } catch {
          // keep existing values on error to avoid flicker
        }
      })()
    }
  })

  async function handleSave(e?: Event) {
    e?.preventDefault()
    isSubmitting = true
    successMessage = null
    errorMessage = null
    try {
      await setProfileDetails({
 firstName, lastName 
})
      const next = (username ?? '').trim()
      if (next && next !== initialUsername) {
        await claimUsername(next)
        initialUsername = next
      }
      successMessage = 'Saved.'
      isEditing = false
    } catch (caught: unknown) {
      console.error('Failed to save profile details', caught)
      errorMessage =
        caught instanceof Error ? caught.message : 'Failed to save.'
    } finally {
      isSubmitting = false
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
      aria-label="Profile"
      tabindex="-1"
      onclick={e => e.stopPropagation()}
      onkeydown={e => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <div class="modal-header">
        <h2 class="modal-title">Profile</h2>
        <button class="close-button" type="button" aria-label="Close" onclick={() => onClose()}
          >✕</button
        >
      </div>

      <div class="modal-grid" role="group" aria-label="Profile split view">
        <aside class="left-pane">
          <header class="left-header">
            <h3 class="left-title">User Information</h3>
          </header>
        </aside>

        <section class="right-pane">
          <form class="form" onsubmit={handleSave}>
            {#if errorMessage}
              <div class="error" role="alert">{errorMessage}</div>
            {/if}
            {#if successMessage}
              <div class="success" role="status">{successMessage}</div>
            {/if}
            {#if isEditing}
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
            {:else}
              <div class="row-2col">
                <div>
                  <span class="field-label">First name</span>
                  <div class="display-field">{firstName || '—'}</div>
                </div>
                <div>
                  <span class="field-label">Last name</span>
                  <div class="display-field">{lastName || '—'}</div>
                </div>
              </div>

              <span class="field-label">Username</span>
              <div class="display-field">{username || '—'}</div>
            {/if}
          </form>
        </section>
      </div>

      <div class="modal-footer">
        {#if isEditing}
          <button type="button" class="primary" onclick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onclick={() => (isEditing = false)} disabled={isSubmitting}
            >Cancel</button
          >
        {:else}
          <button type="button" class="primary" onclick={() => (isEditing = true)}>Edit</button>
        {/if}
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
    border: none;
    color: #eeeeee;
    cursor: pointer;
    border-radius: 6px;
    padding: 0.25rem 0.5rem;
  }

  .modal-grid {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1rem;
    min-height: 280px;
    overflow: hidden;
  }

  .left-pane,
  .right-pane {
    background: #2b3038;
    border-radius: 8px;
    padding: 0.75rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .left-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .left-title {
    margin: 0;
    font-size: 1rem;
  }

  .form {
    display: grid;
    gap: 0.75rem;
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
  .field-label {
    display: block;
    font-size: 0.9rem;
    color: #eeeeee;
    margin-bottom: 0.25rem;
  }

  input[type='text'] {
    width: 100%;
    background: #22262d;
    color: #eeeeee;
    border: 1px solid rgba(238, 238, 238, 0.12);
    border-radius: 8px;
    padding: 0.6rem 0.75rem;
    outline: none;
    transition:
      box-shadow 0.2s,
      border-color 0.2s;
  }

  input[type='text']:focus {
    border-color: #76abae;
    box-shadow: 0 0 0 2px #76abae33;
  }

  .display-field {
    width: 100%;
    background: #22262d;
    color: #eeeeee;
    border: 1px solid rgba(238, 238, 238, 0.12);
    border-radius: 8px;
    padding: 0.6rem 0.75rem;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(238, 238, 238, 0.08);
    margin-top: 0.5rem;
  }

  .error {
    background: rgba(220, 53, 69, 0.15);
    border: 1px solid rgba(220, 53, 69, 0.35);
    color: #ffb3b8;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .success {
    background: rgba(118, 171, 174, 0.15);
    border: 1px solid rgba(118, 171, 174, 0.35);
    color: #cce7e8;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
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

  /* Close button adopts bordered style and hover color */
  .modal-footer button:not(.primary) {
    background: transparent;
    border: 1px solid #76abae;
    color: #eeeeee;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
  }

  .modal-footer button:not(.primary):hover {
    background: rgba(118, 171, 174, 0.15);
  }
</style>
