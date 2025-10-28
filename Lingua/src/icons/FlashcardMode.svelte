<script>
    let { 
        // Changed default fill to 'currentColor' since the SVG is designed to be filled
        fill = 'currentColor', 
        size = 24, 
        // Stroke-related props are often omitted or kept for consistency but won't affect this *filled* icon
        stroke = 'none', 
        strokeWidth = 0, 
        class: className = '',
        ariaLabel = 'Flashcard Mode' 
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
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    
    <path d="M3.604 7.197l7.138 -3.109a.96 .96 0 0 1 1.27 .527l4.924 11.902a1 1 0 0 1 -.514 1.304l-7.137 3.109a.96 .96 0 0 1 -1.271 -.527l-4.924 -11.903a1 1 0 0 1 .514 -1.304z" />
    
    <path d="M15 4h1a1 1 0 0 1 1 1v3.5" />
    <path d="M20 6c.264 .112 .52 .217 .768 .315a1 1 0 0 1 .53 1.311l-2.298 5.374" />
    
</svg>
