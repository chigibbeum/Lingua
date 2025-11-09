<script lang="ts">
    let { 
        stroke = 'currentColor', 
        fill = 'none', 
        size = 24, 
        strokeWidth = 1.5, // Added strokeWidth prop for customization
        class: className = '',
        ariaLabel = 'Edit Text' // Added an ariaLabel prop with a sensible default
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
  <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"></path>
  <path d="M13.5 6.5l4 4"></path>
</svg>