<script lang="ts">
  import { posChipFormat } from './stores/settings'
  let {
    open,
    onClose = () => {},
  }: {
    open: boolean
    onClose?: () => void
  } = $props()

  // Local-only demo settings; wire to real stores later
  let colorScheme: 'system' | 'dark' | 'light' = $state('system')
  let reduceMotion: boolean = $state(false)
  let showTips: boolean = $state(true)
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
      aria-label="Settings"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => { if (e.key === 'Escape') onClose() }}
    >
      <div class="modal-header">
        <h2 class="modal-title">Settings</h2>
        <button class="close-button" type="button" aria-label="Close" onclick={() => onClose()}>✕</button>
      </div>

      <section class="content">
        <div class="group">
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

        <div class="group">
          <div class="row">
            <label for="pos-format">POS chip format</label>
            <select id="pos-format" bind:value={$posChipFormat} aria-label="POS chip format">
              <option value="short">Short (N, V, Adj)</option>
              <option value="full">Full (noun, verb, adjective)</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
          <p class="hint">Choose how part of speech appears in chips.</p>
        </div>

        <div class="group">
          <label class="switch">
            <input type="checkbox" bind:checked={reduceMotion} />
            <span>Reduce motion</span>
          </label>
          <p class="hint">Prefer subtler animations.</p>
        </div>

        <div class="group">
          <label class="switch">
            <input type="checkbox" bind:checked={showTips} />
            <span>Show tips and hints</span>
          </label>
          <p class="hint">Inline guidance in parsing and flashcards.</p>
        </div>
      </section>

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
    width: min(640px, 92vw);
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

  .modal-title { margin: 0; font-size: 1.1rem; }
  .close-button {
    background: transparent;
    border: 1px solid #76abae;
    color: #eeeeee;
    cursor: pointer;
    border-radius: 6px;
    padding: 0.25rem 0.5rem;
  }

  .content {
    display: grid;
    gap: 1rem;
    padding-top: 0.25rem;
  }

  .group { background: #2b3038; border-radius: 8px; padding: 0.75rem; }
  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    align-items: center;
  }

  label { font-size: 0.95rem; }
  select {
    width: 100%;
    background: #22262d;
    color: #eeeeee;
    border: 1px solid rgba(238, 238, 238, 0.12);
    border-radius: 8px;
    padding: 0.5rem 0.6rem;
    outline: none;
  }
  select:focus { border-color: #76abae; box-shadow: 0 0 0 2px #76abae33; }

  .switch {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    user-select: none;
  }
  .switch input { accent-color: #76abae; }
  .hint { margin: 0.35rem 0 0; opacity: 0.85; font-size: 0.85rem; }

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
  .primary:hover { background: rgba(118, 171, 174, 0.15); }
</style>


