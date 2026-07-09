/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0a2540', // primary dark background / buttons
          deep: '#06192a',    // deepest navy — dark text on light bg, darkest cards
          light: '#0f3155',
        },
        cream: '#f4f7f9',      // light background / text-on-dark
        accent: {
          DEFAULT: '#7cbcd3',  // sky accent — italics, highlights
          soft: '#b3d6e2',     // muted paragraph text on dark bg
        },
        slate: {
          DEFAULT: '#5b6e80',  // secondary text on light bg
          light: '#8095a7',    // tertiary text
        },
        good: {
          bg: '#ddeee2',
          text: '#1f5a3a',
        },
        warn: {
          bg: '#f6e4d2',
          text: '#7a4a25',
        },
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Times New Roman', 'serif'],
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(6, 25, 42, 0.06), 0 8px 24px -12px rgba(6, 25, 42, 0.12)',
      },
    },
  },
  plugins: [],
}
