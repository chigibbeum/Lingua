<script lang="ts">
  import { toasts, toastStore } from '$lib/stores/toast'
  import XIcon from '$lib/icons/XIcon.svelte'

  // Use $derived with store auto-subscription for idiomatic Svelte 5 pattern
  const toastList = $derived($toasts)
</script>

{#if toastList.length > 0}
  <div class="toast-container" role="region" aria-label="Notifications" aria-live="polite">
    {#each toastList as toast (toast.id)}
      <div class="toast toast-{toast.type}" role="alert">
        <span class="toast-message">{toast.message}</span>
        <button
          type="button"
          class="toast-dismiss"
          onclick={() => toastStore.dismiss(toast.id)}
          aria-label="Dismiss notification"
        >
          <XIcon size={16} stroke="currentColor" strokeWidth={2} />
        </button>
      </div>
    {/each}
  </div>
{/if}

<style>
  .toast-container {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 400px;
    pointer-events: none;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-radius: var(--lingua-radius, 0.35rem);
    background-color: var(--lingua-bg-section, #31363f);
    color: var(--lingua-text-secondary, #eeeeee);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    pointer-events: auto;
    animation: slideIn 0.25s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .toast {
      animation: none;
    }
  }

  .toast-success {
    border-left: 4px solid var(--lingua-success, #2e7d32);
  }

  .toast-error {
    border-left: 4px solid var(--lingua-error, #c62828);
  }

  .toast-warning {
    border-left: 4px solid var(--lingua-warning, #f59e0b);
  }

  .toast-info {
    border-left: 4px solid var(--lingua-accent, #76abae);
  }

  .toast-message {
    flex: 1;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .toast-dismiss {
    background: transparent;
    border: none;
    padding: 0.25rem;
    cursor: pointer;
    color: var(--lingua-text-secondary, #eeeeee);
    opacity: 0.7;
    transition: opacity 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }

  .toast-dismiss:hover {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 480px) {
    .toast-container {
      left: 1rem;
      right: 1rem;
      bottom: 1rem;
      max-width: none;
    }
  }
</style>
