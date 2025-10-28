<script lang="ts">
    let { 
        stroke = 'currentColor', 
        fill = 'none', 
        size = 24, 
        strokeWidth = 1.5, // Customizable line thickness
        class: className = '', 
        ariaLabel = 'How To Use' // Accessibility label
    } = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" width={size}   height={size}  viewBox="0 0 24 24" 
fill={fill}    stroke={stroke} stroke-width={strokeWidth} 
stroke-linecap="round" stroke-linejoin="round" 
class={className} role="img" 
aria-label={ariaLabel}
>
<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
<path d="M8 8a3.5 3 0 0 1 3.5 -3h1a3.5 3 0 0 1 3.5 3a3 3 0 0 1 -2 3a3 4 0 0 0 -2 4" />
<path d="M12 19l0 .01" />
</svg>