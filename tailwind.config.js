/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        studio: {
          dark: '#121212',
          surface: '#1f2b2b',
          card: '#303d3c',
          cardLight: '#3a4948',
          accent: '#762685',
          accentHover: '#8d2fa0',
          accentMuted: 'rgba(118, 38, 133, 0.25)',
          gold: '#c59d5f',
          bronze: '#b87333',
          border: '#3c4c4b',
          muted: '#94a3b8',
          text: '#f8fafc',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
