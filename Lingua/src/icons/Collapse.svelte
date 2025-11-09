<script lang="ts">
    let { 
        stroke = 'currentColor', 
        fill = 'none', 
        size = 24, 
        strokeWidth = 1.5, // Customizable line thickness
        class: className = '', 
        ariaLabel = 'Collapse' // Accessibility label
    } = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" 
width={size} height={size} viewBox="0 0 24 24" fill={fill} 
stroke={stroke} stroke-width={strokeWidth} 
stroke-linecap="round" stroke-linejoin="round" 
class={className} 
role="img" 
aria-label={ariaLabel}>
<title>{ariaLabel}</title>
<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
<path d="M4 18v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
<path d="M4 9h16" />
<path d="M10 16l2 -2l2 2" />
</svg>
