<script lang="ts">
  let {
    stroke = 'currentColor',
    fill = 'none',
    size = 24,
    strokeWidth = 1.5, // Customizable line thickness
    class: className = '',
    ariaLabel = 'Create Flashcards', // Accessibility label
  } = $props()
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  {fill}
  {stroke}
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  class={className}
  role="img"
  aria-label={ariaLabel}
>
  <title>{ariaLabel}</title>
  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>

  <path
    d="M3.604 7.197l7.138 -3.109a.96 .96 0 0 1 1.27 .527l4.924 11.902a1 1 0 0 1 -.514 1.304l-7.137 3.109a.96 .96 0 0 1 -1.271 -.527l-4.924 -11.903a1 1 0 0 1 .514 -1.304z"
  ></path>

  <path d="M15 4h1a1 1 0 0 1 1 1v3.5"></path>
  <path d="M20 6c.264 .112 .52 .217 .768 .315a1 1 0 0 1 .53 1.311l-2.298 5.374"></path>

  <line x1="7.5" y1="12.5" x2="12.5" y2="12.5"></line>
  <line x1="10.0" y1="10.0" x2="10.0" y2="15.0"></line>
</svg>
