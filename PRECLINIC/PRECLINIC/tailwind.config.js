/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medical: {
          light: '#E6F0FF',
          DEFAULT: '#3B82F6',
          dark: '#1D4ED8',
        }
      }
    },
  },
  plugins: [],
}
