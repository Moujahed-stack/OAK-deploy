/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f8f6f4',
          100: '#efeae4',
          200: '#ddd4c8',
          300: '#c4b5a3',
          400: '#a8947d',
          500: '#8f7a62',
          600: '#7a6654',
          700: '#655346',
          800: '#55463c',
          900: '#493d35',
        },
      },
    },
  },
  plugins: [],
}
