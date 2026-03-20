import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#FAFAFA',
          DEFAULT: '#FFFFFF',
          dark: '#121212',
        },
        accent: {
          DEFAULT: '#C5A880', // Premium Gold/Beige tint
          hover: '#B09060',
        },
        surface: {
          light: '#F4F4F4',
          dark: '#1E1E1E',
        },
        text: {
          light: '#111111',
          muted: '#666666',
          dark: '#EAEAEA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Inter', 'sans-serif'], // Forcing sans everywhere for SNITCH vibe
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'subtle-zoom': 'subtleZoom 10s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        subtleZoom: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
export default config
