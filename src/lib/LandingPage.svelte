<script lang="ts">
  import { currentRoute } from './stores/router'

  function goToLogin() {
    currentRoute.set('login')
  }
</script>

<main class="landing" aria-labelledby="welcome-title">
  <section class="content">
    <h1 id="welcome-title">Welcome to Lingua</h1>
    <button class="login-link" type="button" onclick={goToLogin} aria-label="Go to login">
      Log in
    </button>
  </section>
</main>

<style>
  .landing {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 1.5rem 1rem;
    background-color: #222831;
    color: #eeeeee;
  }

  .content {
    display: grid;
    gap: 0.75rem;
    place-items: center;
    text-align: center;
  }

  h1 {
    margin: 0;
    font-size: 2rem;
  }

  .login-link {
    background: transparent;
    border: none;
    color: #76abae;
    cursor: pointer;
    padding: 0;
    font-size: 1rem;
  }
</style>
