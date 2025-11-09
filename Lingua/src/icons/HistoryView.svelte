<script lang="ts">
    let { 
        stroke = 'currentColor', 
        fill = 'none', 
        size = 24, 
        strokeWidth = 1.5, // Added strokeWidth prop for line thickness
        class: className = '',
        ariaLabel = 'Recent Activity' // Added ariaLabel prop with a sensible default
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
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M12 8l0 4l2 2" />
  <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
</svg>