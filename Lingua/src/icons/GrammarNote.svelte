<script lang="ts">
    let { 
        fill = 'none', 
        size = 24, 
        stroke = 'currentColor', 
        strokeWidth = 2, 
        class: className = '',
        ariaLabel = 'Grammar Note' 
    } = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" 
width={size} height={size} viewBox="0 0 24 24" fill={fill} 
stroke={stroke} stroke-width={strokeWidth} 
stroke-linecap="round" stroke-linejoin="round" 
class={className} role="img" 
aria-label={ariaLabel}>
<title>{ariaLabel}</title>
<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
<path d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" />
<path d="M14 8h-2a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2v-4h-1" />
</svg>