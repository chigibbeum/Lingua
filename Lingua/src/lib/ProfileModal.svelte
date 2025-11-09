<script lang="ts">
  import { user as authUser } from './stores/auth'

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

  function deriveNames(displayName?: string | null): { first: string; last: string } {
    if (!displayName) return { first: '', last: '' }
    const parts = displayName.trim().split(/\s+/)
    if (parts.length === 1) return { first: parts[0] ?? '', last: '' }
    return { first: parts[0] ?? '', last: parts.slice(1).join(' ') }
  }

  $effect(() => {
    if (open) {
      const displayName = $authUser?.displayName ?? ''
      const email = $authUser?.email ?? ''
      const parts = displayName.trim() ? displayName.trim().split(/\s+/) : []
      firstName = parts[0] ?? ''
      if (parts.length > 1) {
        lastName = parts.slice(1).join(' ')
      } else {
        lastName = ''
      }
      username = (displayName || (email ? email.split('@')[0] : '')) as unknown as string
    }
  })
</script>

{#if open}
  <div
    class="modal-backdrop"
    role="presentation"
    tabindex="-1"
    onclick={() => onClose()}
    onkeydown={(e) => { if (e.key === 'Escape') onClose() }}
  >
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-label="Profile"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => { if (e.key === 'Escape') onClose() }}
    >
      <div class="modal-header">
        <h2 class="modal-title">Profile</h2>
        <button class="close-button" type="button" aria-label="Close" onclick={() => onClose()}>✕</button>
      </div>

      <div class="modal-grid" role="group" aria-label="Profile split view">
        <aside class="left-pane">
          <header class="left-header">
            <h3 class="left-title">User Information</h3>
          </header>
        </aside>

        <section class="right-pane">
          <form class="form" onsubmit={(e) => e.preventDefault()}>
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
          </form>
        </section>
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
    box-shadow: 0 10px 30px rgba(0,0,0,0.35);
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

  .left-pane, .right-pane {
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

  input[type="text"] {
    width: 100%;
    background: #22262d;
    color: #eeeeee;
    border: 1px solid rgba(238, 238, 238, 0.12);
    border-radius: 8px;
    padding: 0.6rem 0.75rem;
    outline: none;
    transition: box-shadow 0.2s, border-color 0.2s;
  }

  input[type="text"]:focus {
    border-color: #76abae;
    box-shadow: 0 0 0 2px #76abae33;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
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
</style>


