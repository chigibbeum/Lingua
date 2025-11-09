/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,svelte}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors from your design system (§ 3.1)
        'bg-main': '#222831',
        'bg-section': '#31363f',
        'text-primary': '#76abae',
        'text-secondary': '#eeeeee',
        'button-bg': '#31363f',
        'button-text': '#eeeeee',
        'button-hover': '#415780',
        'flashcard-bg': '#435446',
        'flashcard-text': '#9ab0a2',
      },
    },
  },
  plugins: [],
}

