<script lang="ts">
    let { 
        stroke = 'currentColor', 
        fill = 'none', 
        size = 24, 
        strokeWidth = 1.5, // Added strokeWidth prop for line thickness
        class: className = '',
        ariaLabel = 'Parse Text' // Added ariaLabel prop with a sensible default
    } = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}   height={size}  viewBox="0 0 24 24"
  fill={fill}    stroke={stroke} stroke-width={strokeWidth} 
  stroke-linecap="round" stroke-linejoin="round"
  class={className}
  role="img"
  aria-label={ariaLabel}
>
<title>{ariaLabel}</title>
  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
  <path d="M6 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
  <path d="M18 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
  <path d="M7.5 16.5l9 -9"></path>
</svg>