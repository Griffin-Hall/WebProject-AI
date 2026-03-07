import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        voyage: {
          50: '#eef6ff',
          100: '#d9ecff',
          200: '#bcd9ff',
          300: '#8ec0ff',
          400: '#599dff',
          500: '#3377ff',
          600: '#1a5af5',
          700: '#1447e1',
          800: '#1739b6',
          900: '#19338f',
          950: '#121f57',
        },
        aurora: {
          DEFAULT: '#A855F7',
          light: '#C084FC',
          dark: '#7C3AED',
          glow: '#A855F7',
        },
        coral: {
          DEFAULT: '#FF6B6B',
          light: '#FF8E8E',
          dark: '#E85555',
        },
        sand: {
          DEFAULT: '#F4E8C1',
          light: '#FAF3E0',
          dark: '#D4C9A1',
        },
        night: {
          DEFAULT: '#0F172A',
          light: '#1E293B',
          surface: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(0.9)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
