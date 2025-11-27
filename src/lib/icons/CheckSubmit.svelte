<script lang="ts">
  let {
    stroke = 'currentColor',
    fill = 'none',
    size = 24,
    strokeWidth = 1.5,
    class: className = '',
    ariaLabel = 'Submit',
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
  <path d="M5 12l5 5l10 -10"></path>
</svg>
