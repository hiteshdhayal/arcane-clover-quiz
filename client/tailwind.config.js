/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-blue': '#00f2ff',
        'neon-purple': '#bc13fe',
        'dark-navy': '#050a14',
        'glass-white': 'rgba(255, 255, 255, 0.1)',
      },
      boxShadow: {
        'neon': '0 0 10px #00f2ff, 0 0 20px #00f2ff',
        'neon-purple': '0 0 10px #bc13fe, 0 0 20px #bc13fe',
      }
    },
  },
  plugins: [],
}
