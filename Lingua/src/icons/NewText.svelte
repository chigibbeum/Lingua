<script>
    let { 
        stroke = 'currentColor', 
        fill = 'none', 
        size = 24, 
        strokeWidth = 1.5, // Added strokeWidth prop for line thickness
        class: className = '',
        ariaLabel = 'New Text' // Added ariaLabel prop with a sensible default
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
  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
  <path d="M3 7v-2h13v2"></path>
  <path d="M10 5v14"></path>
  <path d="M12 19h-4"></path>
  <path d="M15 13v-1h6v1"></path>
  <path d="M18 12v7"></path>
  <path d="M17 19h2"></path>
</svg>