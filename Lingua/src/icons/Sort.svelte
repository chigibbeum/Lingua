<script lang="ts">
    let { 
        stroke = 'currentColor', 
        fill = 'none', 
        size = 24, 
        strokeWidth = 1.5, // Customizable line thickness
        class: className = '', 
        ariaLabel = 'Sort' // Accessibility label
    } = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" 
width={size}   height={size}  viewBox="0 0 24 24" fill={fill}    
stroke={stroke} stroke-width={strokeWidth} 
stroke-linecap="round" stroke-linejoin="round" 
class={className} 
role="img" 
aria-label={ariaLabel}
>
<title>{ariaLabel}</title>
<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
<path d="M3 9l4 -4l4 4m-4 -4v14" />
<path d="M21 15l-4 4l-4 -4m4 4v-14" />
</svg>