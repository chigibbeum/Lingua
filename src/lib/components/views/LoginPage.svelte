<script lang="ts">
  import NavigationBar from '../layout/NavigationBar.svelte'
  import {
    loginWithEmailPassword,
    signupWithEmailPassword,
    loginWithGoogle,
    isLoggedIn,
  } from '$lib/stores/auth'
  import ProfileModal from '../modals/ProfileModal.svelte'
  import SentenceLibraryModal from '../modals/SentenceLibraryModal.svelte'
  import DeckLibraryModal from '../modals/DeckLibraryModal.svelte'
  import SettingsModal from '../modals/SettingsModal.svelte'
  import { goto } from '$app/navigation'
  import { base } from '$app/paths'

  let email = $state('')
  let password = $state('')
  let confirmPassword = $state('')

  let rememberMe = $state(true)
  let isSubmitting = $state(false)
  let errorMessage = $state<string | null>(null)
  let authMode = $state<'signin' | 'signup'>('signin')
  let showProfile = $state(false)
  let showSentenceLibrary = $state(false)
  let showDeckLibrary = $state(false)
  let showSettings = $state(false)

  const goToHome = () => goto(`${base}/home`)
  const goToLanding = () => goto(`${base}/landing`)

  async function handleEmailLogin(e: Event) {
    e.preventDefault()
    errorMessage = null
    if (!email || !password) {
      errorMessage = 'Please enter your email and password.'
      return
    }
    isSubmitting = true
    try {
      await loginWithEmailPassword(email.trim(), password, rememberMe)
      goToHome()
    } catch (caught: unknown) {
      console.error('Login failed', caught)
      const fallback = 'Login failed. Check your credentials and try again.'
      errorMessage = caught instanceof Error ? caught.message : fallback
    } finally {
      isSubmitting = false
    }
  }

  async function handleGoogleLogin() {
    errorMessage = null
    isSubmitting = true
    try {
      await loginWithGoogle(rememberMe)
      goToHome()
    } catch (caught: unknown) {
      console.error('Google login failed', caught)
      const fallback = 'Google login failed. Please try again.'
      errorMessage = caught instanceof Error ? caught.message : fallback
    } finally {
      isSubmitting = false
    }
  }

  async function handleEmailSignup(e: Event) {
    e.preventDefault()
    errorMessage = null
    if (!email || !password || !confirmPassword) {
      errorMessage = 'Please enter your email, password, and confirm your password.'
      return
    }
    if (password !== confirmPassword) {
      errorMessage = 'Passwords do not match.'
      return
    }
    isSubmitting = true
    try {
      await signupWithEmailPassword(email.trim(), password, rememberMe)
      goToHome()
    } catch (caught: unknown) {
      console.error('Sign up failed', caught)
      const fallback = 'Sign up failed. Please try again.'
      errorMessage = caught instanceof Error ? caught.message : fallback
    } finally {
      isSubmitting = false
    }
  }

  function switchMode(next: 'signin' | 'signup') {
    authMode = next
    errorMessage = null
    // Clear sensitive fields when switching modes
    password = ''
    confirmPassword = ''
  }

  $effect(() => {
    if ($isLoggedIn) {
      goToHome()
    }
  })
</script>

<NavigationBar
  onOpenSentences={() => (showSentenceLibrary = true)}
  onOpenDecks={() => (showDeckLibrary = true)}
  onOpenSettings={() => (showSettings = true)}
/>

<main class="login-page">
  <section class="login-card" aria-labelledby="login-title">
    <h1 id="login-title">{authMode === 'signup' ? 'Create account' : 'Welcome back'}</h1>
    <p class="subtitle">
      {authMode === 'signup' ? 'Sign up to get started' : 'Sign in to continue'}
    </p>

    {#if errorMessage}
      <div class="error" role="alert">{errorMessage}</div>
    {/if}

    <form
      class="login-form"
      onsubmit={authMode === 'signup' ? handleEmailSignup : handleEmailLogin}
    >
      <label for="email">Email</label>
      <input
        id="email"
        type="email"
        placeholder="you@example.com"
        bind:value={email}
        autocomplete="email"
        required
      />

      <label for="password">Password</label>
      <input
        id="password"
        type="password"
        placeholder="••••••••"
        bind:value={password}
        autocomplete={authMode === 'signup' ? 'new-password' : 'current-password'}
        required
      />

      {#if authMode === 'signup'}
        <label for="confirm-password">Confirm password</label>
        <input
          id="confirm-password"
          type="password"
          placeholder="••••••••"
          bind:value={confirmPassword}
          autocomplete="new-password"
          required
        />
      {/if}

      <div class="row">
        <label class="checkbox">
          <input type="checkbox" bind:checked={rememberMe} />
          <span>Remember me</span>
        </label>
        <button
          class="link"
          type="button"
          onclick={goToLanding}
          aria-label="Back to landing">Back</button
        >
      </div>

      <button class="primary" type="submit" disabled={isSubmitting}>
        {#if authMode === 'signup'}
          {isSubmitting ? 'Creating account…' : 'Create account'}
        {:else}
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        {/if}
      </button>

      {#if authMode === 'signup'}
        <button
          class="google signup"
          type="button"
          onclick={() => switchMode('signin')}
          disabled={isSubmitting}
        >
          Have an account? Sign in
        </button>
      {:else}
        <button
          class="google signup"
          type="button"
          onclick={() => switchMode('signup')}
          disabled={isSubmitting}
        >
          Create an account
        </button>
      {/if}
    </form>

    <div class="separator" role="separator" aria-label="or"></div>

    <button class="google" type="button" onclick={handleGoogleLogin} disabled={isSubmitting}>
      Continue with Google
    </button>
  </section>
</main>

<SentenceLibraryModal open={showSentenceLibrary} onClose={() => (showSentenceLibrary = false)} />
<DeckLibraryModal open={showDeckLibrary} onClose={() => (showDeckLibrary = false)} />
<SettingsModal open={showSettings} onClose={() => (showSettings = false)} />
<ProfileModal open={showProfile} onClose={() => (showProfile = false)} />

<style>
  .login-page {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 1.5rem 1rem;
    padding-top: calc(56px + 1.5rem); /* Navigation bar height + padding */
    background-color: #222831;
  }

  .login-card {
    width: 100%;
    max-width: 420px;
    background-color: #31363f;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    color: #eeeeee;
  }

  h1 {
    margin: 0 0 0.25rem 0;
    font-size: 1.5rem;
    color: #eeeeee;
  }

  .subtitle {
    margin: 0 0 1rem 0;
    color: #d8d8d8;
    font-size: 0.95rem;
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

  .login-form {
    display: grid;
    gap: 0.75rem;
  }

  label {
    font-size: 0.9rem;
    color: #eeeeee;
  }

  input[type='email'],
  input[type='password'] {
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

  input[type='email']:focus,
  input[type='password']:focus {
    border-color: #76abae;
    box-shadow: 0 0 0 2px #76abae33;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.25rem;
  }

  .checkbox {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #d8d8d8;
    cursor: pointer;
    user-select: none;
  }

  .checkbox input {
    width: 16px;
    height: 16px;
    accent-color: #76abae;
  }

  .primary {
    margin-top: 0.5rem;
    width: 100%;
    background: #76abae;
    color: #222831;
    border: none;
    border-radius: 8px;
    padding: 0.625rem 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: filter 0.2s;
  }

  .primary:hover:enabled,
  .google:hover:enabled {
    filter: brightness(1.06);
  }

  .primary:disabled,
  .google:disabled {
    opacity: 0.7;
    cursor: default;
  }

  .separator {
    margin: 1rem 0;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }

  .google {
    width: 100%;
    background: transparent;
    color: #eeeeee;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    padding: 0.625rem 0.75rem;
    cursor: pointer;
    transition:
      background-color 0.2s,
      border-color 0.2s;
  }

  .signup:active {
    background: #76abae;
    color: #222831;
    border-color: transparent;
  }

  .link {
    background: transparent;
    border: none;
    color: #76abae;
    cursor: pointer;
    padding: 0;
  }
</style>
