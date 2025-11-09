<script lang="ts">
    let { 
        stroke = 'currentColor', 
        fill = 'none', 
        size = 24, 
        strokeWidth = 1.5, // Added strokeWidth prop for line thickness
        class: className = '',
        ariaLabel = 'Save Notes' // Added ariaLabel prop with a sensible default
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
  <path d="M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2"></path>
  <path d="M12 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
  <path d="M14 4l0 4l-6 0l0 -4"></path>
</svg>