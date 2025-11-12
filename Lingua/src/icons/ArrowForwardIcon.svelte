<script lang="ts">
    export let stroke: string = 'currentColor'
    export let fill: string = 'none'
    export let size: number = 24
    export let strokeWidth: number = 1.5 // Customizable line thickness
    export let className: string = ''
    export let ariaLabel: string = 'Forward' // Accessibility label
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
<path d="M20 12l-10 0" />
<path d="M20 12l-4 4" />
<path d="M20 12l-4 -4" />
<path d="M4 4l0 16" />
</svg>

