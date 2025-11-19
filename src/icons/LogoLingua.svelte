<script lang="ts">
  let {
    stroke = 'currentColor',
    fill = 'none',
    size = 24,
    strokeWidth = 1.5,
    class: className = '',
    ariaLabel = 'Lingua logo',
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
  <path d="M4 7.5a7.5 7.5 0 1 1 13.9 3.6l1.6 5.9l-5.9-1.6a7.5 7.5 0 0 1-9.6-7.9z"></path>
  <path d="M8.5 8v5.5a.5.5 0 0 0 .5.5h4"></path>
  <path d="M15.5 11.5c0 2 -1.5 3.5 -3.5 3.5"></path>
</svg>
