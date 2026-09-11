/**
 * Design System (Issue #22)
 * Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40 (NativeWind p-1=4 … p-10=40)
 * Card radius: rounded-2xl (16). Button: rounded-2xl, min-h-14.
 * Do not add a second UI library.
 */
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
        primary: {
          DEFAULT: '#0F6B4D',
          dark: '#0A4D38',
          light: '#E8F5F0',
        },
        success: '#15803D',
        warning: '#F59E0B',
        danger: '#DC2626',
        error: '#B91C1C',
        info: '#2563EB',
        background: '#F4F6F8',
        surface: '#FFFFFF',
        'surface-secondary': '#E8F5F0',
        pastel: {
          vehicle: '#DCFCE7',
          school: '#E0E7FF',
          route: '#FEF3C7',
          student: '#EDE9FE',
        },
        ink: {
          DEFAULT: '#0F172A',
          secondary: '#334155',
          muted: '#64748B',
        },
        divider: '#CBD5E1',
        disabled: '#94A3B8',
        morning: '#F59E0B',
        afternoon: '#2563EB',
        boarding: '#0F6B4D',
        absent: '#DC2626',
        dropoff: '#1D4ED8',
      },
      borderRadius: {
        card: '16px',
        button: '16px',
      },
    },
  },
  plugins: [],
};
