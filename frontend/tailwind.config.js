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
        dark: {
          900: '#07090e',
          850: '#0c1017',
          800: '#111722',
          700: '#1a2332',
          600: '#263449',
        },
        thermal: {
          extreme: '#ef4444',    // crimson red
          veryhigh: '#f97316',   // deep orange
          high: '#f59e0b',       // amber yellow
          moderate: '#eab308',   // golden yellow
          low: '#10b981',        // emerald green
          cool: '#06b6d4',       // cyan blue
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(239, 68, 68, 0.4), 0 0 10px rgba(239, 68, 68, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(239, 68, 68, 0.8), 0 0 30px rgba(249, 115, 22, 0.5)' },
        }
      }
    },
  },
  plugins: [],
}
