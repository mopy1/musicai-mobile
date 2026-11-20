/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        night: '#070b14',
        surface: '#0f172a',
        card: '#111827',
        cardHover: '#1f2937',
        primary: '#d97745',
        primaryHover: '#ee9a6a',
        primaryDeep: '#b4532d',
        muted: '#94a3b8',
        borderSubtle: '#1f2937',
        borderStrong: '#334155',
        success: '#34d399',
        warning: '#fbbf24',
        danger: '#fb7185',
      },
    },
  },
  plugins: [],
};
