import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        white: 'rgb(var(--color-white) / <alpha-value>)',
        black: 'rgb(var(--color-black) / <alpha-value>)',
        slate: {
          50: 'rgb(var(--color-slate-50) / <alpha-value>)',
          100: 'rgb(var(--color-slate-100) / <alpha-value>)',
          200: 'rgb(var(--color-slate-200) / <alpha-value>)',
          300: 'rgb(var(--color-slate-300) / <alpha-value>)',
          400: 'rgb(var(--color-slate-400) / <alpha-value>)',
          500: 'rgb(var(--color-slate-500) / <alpha-value>)',
          600: 'rgb(var(--color-slate-600) / <alpha-value>)',
          700: 'rgb(var(--color-slate-700) / <alpha-value>)',
          800: 'rgb(var(--color-slate-800) / <alpha-value>)',
          900: 'rgb(var(--color-slate-900) / <alpha-value>)',
        },
        voyage: {
          50: '#ecf7ff',
          100: '#d9efff',
          200: '#b8e2ff',
          300: '#84cbff',
          400: '#48adff',
          500: '#2f8dff',
          600: '#1474ff',
          700: '#1159dd',
          800: '#164ab2',
          900: '#173f8f',
          950: '#0f2756',
        },
        aurora: {
          DEFAULT: '#19a7ff',
          light: '#5ec4ff',
          dark: '#0f7ac7',
          glow: '#22b2ff',
        },
        coral: {
          DEFAULT: '#ff6b6b',
          light: '#ff8e8e',
          dark: '#e85555',
        },
        sand: {
          DEFAULT: '#f4e8c1',
          light: '#faf3e0',
          dark: '#d4c9a1',
        },
        night: {
          DEFAULT: 'rgb(var(--color-night-default) / <alpha-value>)',
          light: 'rgb(var(--color-night-light) / <alpha-value>)',
          surface: 'rgb(var(--color-night-surface) / <alpha-value>)',
        },
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Manrope', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(47, 141, 255, 0.12)',
        'glow-md': '0 0 30px rgba(47, 141, 255, 0.2)',
        'glow-lg': '0 0 60px rgba(47, 141, 255, 0.26)',
        'glow-aurora': '0 0 40px rgba(25, 167, 255, 0.2)',
        'glow-aurora-lg': '0 0 80px rgba(25, 167, 255, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 6s ease-in-out infinite',
        sparkle: 'sparkle 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        drift: 'drift 20s ease-in-out infinite',
        'drift-reverse': 'driftReverse 25s ease-in-out infinite',
        'glow-pulse': 'glowPulse 4s ease-in-out infinite',
        'typewriter-blink': 'blink 1.06s steps(1) infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
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
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '50%': { transform: 'translate(-20px, 15px) scale(0.95)' },
          '75%': { transform: 'translate(15px, 25px) scale(1.02)' },
        },
        driftReverse: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(-25px, 20px) scale(1.03)' },
          '50%': { transform: 'translate(20px, -15px) scale(0.97)' },
          '75%': { transform: 'translate(-15px, -20px) scale(1.05)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.75' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }: { addUtilities: Function }) {
      addUtilities({
        '.scrollbar-thin': {
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(var(--color-slate-500), 0.28)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(var(--color-slate-500), 0.42)',
          },
        },
      });
    },
  ],
} satisfies Config;
