/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        harbor: '#E9EFF1',
        sheet: '#FFFFFF',
        spruce: {
          DEFAULT: '#10302F',
          dark: '#0A1E1D',
          light: '#1B4745',
        },
        tide: {
          DEFAULT: '#2F6F73',
          hover: '#26595C',
          light: '#E6F0F0',
        },
        signal: {
          DEFAULT: '#F0A030',
          hover: '#D98E25',
          light: '#FEF6EA',
        },
        lilac: {
          DEFAULT: '#6B5A8E',
          light: '#F2EFF7',
        },
        brick: {
          DEFAULT: '#B23A2B',
          light: '#FBEBE9',
        },
        navy: {
          950: '#070B14',
          900: '#0B1120',
          850: '#0F172A',
          800: '#151F36',
          700: '#1E293B',
          600: '#334155',
        }
      },
      fontFamily: {
        sans: ['"Bricolage Grotesque"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        serif: ['"Newsreader"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        wave: {
          '0%, 100%': { height: '12px' },
          '50%': { height: '32px' },
        },
        traceFlash: {
          '0%': { backgroundColor: 'rgba(240, 160, 48, 0.25)', borderColor: '#F0A030' },
          '100%': { backgroundColor: 'transparent' },
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave-bar': 'wave 1.2s ease-in-out infinite',
        'trace-flash': 'traceFlash 1.4s ease-out forwards',
      }
    },
  },
  plugins: [],
}
