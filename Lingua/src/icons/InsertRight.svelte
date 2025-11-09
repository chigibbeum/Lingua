<script lang="ts">
    let { 
        stroke = 'currentColor', 
        fill = 'none', 
        size = 24, 
        strokeWidth = 1.5, // Customizable line thickness
        class: className = '', 
        ariaLabel = 'Insert Right' // Accessibility label
    } = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" 
width={size} height={size} viewBox="0 0 24 24" 
fill={fill} stroke={stroke} stroke-width={strokeWidth} 
stroke-linecap="round" stroke-linejoin="round" 
class={className} 
role="img"
aria-label={ariaLabel}
>
<title>{ariaLabel}</title>
<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
<path d="M6 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1z" />
<path d="M15 12l4 0" />
<path d="M17 10l0 4" />
</svg>