/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ch-gold': '#F7D940',
        'ch-gold-light': '#F7D940',
        'ch-black': '#1a1a1a',
        'ch-white': '#FFFFFF',
        'ch-gray': '#f5f5f5',
      },
    },
  },
  plugins: [],
}

