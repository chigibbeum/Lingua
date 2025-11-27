<script lang="ts">
  let {
    stroke = 'currentColor',
    fill = 'none',
    size = 24,
    strokeWidth = 1.5, // Customizable line thickness
    class: className = '',
    ariaLabel = 'Deck Library', // Accessibility label
  } = $props()
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  {fill}
  {stroke}
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  class={className}
  role="img"
  aria-label={ariaLabel}
>
  <title>{ariaLabel}</title>

  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
  <path d="M19 5v14a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2"></path>
  <path d="M8 6h.01"></path>
  <path d="M16 18h.01"></path>
  <path d="M12 9v6"></path>
</svg>
