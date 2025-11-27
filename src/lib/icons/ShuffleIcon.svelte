<script lang="ts">
  let {
    stroke = 'currentColor',
    fill = 'none',
    size = 24,
    strokeWidth = 1.5, // Customizable line thickness
    class: className = '',
    ariaLabel = 'Shuffle', // Accessibility label
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
  <path d="M18 4l3 3l-3 3"></path>
  <path d="M18 20l3 -3l-3 -3"></path>
  <path d="M3 7h3a5 5 0 0 1 5 5a5 5 0 0 0 5 5h5"></path>
  <path d="M21 7h-5a4.978 4.978 0 0 0 -3 1m-4 8a4.984 4.984 0 0 1 -3 1h-3"></path>
</svg>
