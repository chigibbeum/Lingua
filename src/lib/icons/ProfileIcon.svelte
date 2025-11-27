<script lang="ts">
  let {
    stroke = 'currentColor',
    fill = 'none',
    size = 24,
    strokeWidth = 1.5, // Added strokeWidth prop for line thickness
    class: className = '',
    ariaLabel = 'Profile', // Added ariaLabel prop with a sensible default
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
  <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"></path>
  <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"></path>
</svg>
