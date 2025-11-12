<script lang="ts">
    let { 
        stroke = 'currentColor', 
        fill = 'none', 
        size = 24, 
        strokeWidth = 1.5, // Customizable line thickness
        class: className = '', 
        ariaLabel = 'Back' // Accessibility label
    } = $props();
</script>
<svg xmlns="http://www.w3.org/2000/svg" 
width={size} height={size} viewBox="0 0 24 24" 
fill={fill} stroke={stroke} stroke-width={strokeWidth} 
stroke-linecap="round" stroke-linejoin="round" 
class={className} 
role="img" 
aria-label={ariaLabel}>
<title>{ariaLabel}</title>
<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
<path d="M4 12l10 0" />
<path d="M4 12l4 4" />
<path d="M4 12l4 -4" />
<path d="M20 4l0 16" />
</svg>