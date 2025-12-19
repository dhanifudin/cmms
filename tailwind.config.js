/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors for SSO providers
        talenta: {
          DEFAULT: '#E31E24',
          hover: '#C11A1F',
          light: '#FFF5F5',
        },
        idaman: {
          DEFAULT: '#0066CC',
          hover: '#0052A3',
          light: '#EFF6FF',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
