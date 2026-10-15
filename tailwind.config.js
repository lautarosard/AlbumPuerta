/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          magenta: '#E6007E',
          cyan: '#00E5FF',
          yellow: '#FFEB3B',
          violet: '#8A2BE2',
          dark: '#121212',
          surface: '#1E1E1E',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
