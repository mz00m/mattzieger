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
          bg: '#FAF7F2',             // warm linen background
          card: '#F2EDE4',           // warm cream cards
          border: '#E2DCD2',          // soft sand border
          gold: '#B8935A',            // warm gold accent
          'gold-light': '#D4B88A',    // lighter gold
          'gold-dim': '#A07D48',      // deep gold
          cream: '#2C2520',           // espresso (main text)
          terracotta: '#C07A5A',      // warm terracotta accent
          mocha: '#A47864',           // mocha mid-tone
          wine: '#8B3A4A',            // rich wine accent
          'wine-light': '#A8506A',    // lighter wine for hover
          sage: '#7D8B74',            // sage green accent
          candle: '#F5DEB3',          // soft amber glow
          'text-primary': '#2C2520',  // espresso
          'text-secondary': '#78716C', // warm gray
          'text-dim': '#A8A29E',       // stone
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
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
