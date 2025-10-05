/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mun-red': '#8B0000',
        'mun-gold': '#FFD700',
        'mun-orange': '#FFA500',
      },
    },
  },
  plugins: [],
}
