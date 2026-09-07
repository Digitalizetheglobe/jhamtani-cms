/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      colors: {
        jhamtani: {
          gold: '#C5A880',
          hover: '#A0725B',
          champagne: '#C1AF86',
          bronze: '#5B584C',
          ink: '#191f26',
          navy: '#171a1f',
          cream: '#f5f3ef',
        },
        red: {
          50: '#faf6f0',
          100: '#f3eadc',
          200: '#e4d3b8',
          300: '#d4be96',
          400: '#C5A880',
          500: '#C5A880',
          600: '#C5A880',
          700: '#A0725B',
          800: '#5B584C',
          900: '#191f26',
        },
        rose: {
          50: '#faf6f0',
          100: '#f3eadc',
          400: '#C5A880',
          500: '#C5A880',
          600: '#C5A880',
          700: '#A0725B',
        },
        gray: {
          50: '#f5f3ef',
        },
        blue: {
          50: '#faf6f0',
          100: '#f3eadc',
          200: '#e4d3b8',
          400: '#C5A880',
          500: '#C5A880',
          600: '#C5A880',
          700: '#A0725B',
          800: '#5B584C',
        },
      },
    },
  },
  plugins: [],
}
