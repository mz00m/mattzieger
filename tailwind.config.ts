import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dinner: {
          bg: '#F8F5F0',           // warm cream background
          card: '#FFFFFF',          // clean white cards
          border: '#E6DDD1',        // warm light border
          gold: '#9A7B56',          // cognac/amber accent (readable on light)
          'gold-light': '#C4A87A',  // softer gold for highlights
          'gold-dim': '#7A6240',    // deep amber
          cream: '#2A2118',         // espresso (main text on light bg)
          wine: '#8B3A4A',          // rich wine accent
          'wine-light': '#A85465',  // lighter wine for hover
          candle: '#D4A030',        // warm amber glow
          'text-primary': '#2A2118',  // espresso
          'text-secondary': '#6B5E52', // warm brown
          'text-dim': '#A89888',      // warm tan
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Lora', 'Georgia', 'serif'],
        mono: ['Courier New', 'monospace'],
      },
      animation: {
        'candle-flicker': 'flicker 3s ease-in-out infinite',
        'pulse-gentle': 'pulse-gentle 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'pulse-gentle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
