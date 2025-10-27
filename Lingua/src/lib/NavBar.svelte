<script lang="ts">
  function goToCreate() {
    location.hash = '#/create'
  }
</script>

<nav class="navbar" aria-label="Primary">
  <a class="brand" href="#/">Lingua</a>
  <div class="nav-actions">
    <button type="button" class="nav-btn">login</button>
    <button type="button" class="nav-btn" on:click={goToCreate}>create</button>
    <button type="button" class="nav-btn">lexicon</button>
  </div>
</nav>

<style>
  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background-color: #31363F; /* § 3.1 Section/Div Backgrounds */
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  .brand {
    color: #76ABAE; /* § 3.1 Primary Text */
    font-weight: 700;
    letter-spacing: 0.08em;
  }
  .nav-actions {
    display: flex;
    gap: 0.75rem;
  }
  /* Buttons inherit global styles from app.css */
</style>

