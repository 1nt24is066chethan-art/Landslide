/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Core operational (dark navy command-center) palette
        surface: {
          950: '#0a0e14',
          900: '#0f1420',
          800: '#151b2c',
          700: '#1c2438',
          600: '#28324a',
          border: '#26304a',
        },
        accent: {
          DEFAULT: '#3b82f6',
          soft: '#60a5fa',
        },
        // Risk colors — used consistently everywhere via riskUtils.js
        risk: {
          low: '#22c55e',
          lowSoft: '#16341f',
          medium: '#f59e0b',
          mediumSoft: '#3a2a10',
          high: '#ef4444',
          highSoft: '#3a1414',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -8px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
