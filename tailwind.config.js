/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0F6B4D',
          dark: '#0A4D38',
          light: '#E8F5F0',
        },
        morning: '#F59E0B',
        afternoon: '#2563EB',
        boarding: '#0F6B4D',
        absent: '#DC2626',
        dropoff: '#1D4ED8',
      },
    },
  },
  plugins: [],
};
