/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        'ch-gold': '#F7D940',
        'ch-gold-light': '#F7E680',
        'ch-black': '#1a1a1a',
      }
    },
  },
  plugins: [],
}

