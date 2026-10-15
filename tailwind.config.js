const brand = {
  magenta: '#E6007E',
  cyan: '#00E5FF',
  yellow: '#FFEB3B',
  violet: '#8A2BE2',
  dark: '#121212',
  surface: '#1E1E1E',
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand,
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
      },
      keyframes: {
        'cromo-pop': {
          '0%': { transform: 'scale(0.6) rotate(-8deg)', opacity: '0' },
          '60%': { transform: 'scale(1.08) rotate(2deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        flash: {
          '0%, 100%': { boxShadow: '0 0 0 0 transparent' },
          '50%': { boxShadow: '0 0 0 6px var(--accent), 0 0 32px 4px var(--accent)' },
        },
        'sheet-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        holo: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '300% 50%' },
        },
        sheen: {
          '0%': { transform: 'translateX(-120%) skewX(-20deg)' },
          '60%, 100%': { transform: 'translateX(220%) skewX(-20deg)' },
        },
        glow: {
          '0%, 100%': { boxShadow: `0 0 12px 0 ${brand.magenta}99` },
          '50%': { boxShadow: `0 0 28px 6px ${brand.cyan}b3` },
        },
      },
      animation: {
        'cromo-pop': 'cromo-pop 600ms cubic-bezier(0.2, 1.4, 0.4, 1) both',
        // Just-unlocked card: pop in, then flash its accent glow a few times.
        'cromo-new':
          'cromo-pop 600ms cubic-bezier(0.2, 1.4, 0.4, 1) both, flash 900ms ease-in-out 600ms 3',
        flash: 'flash 900ms ease-in-out 3',
        'sheet-up': 'sheet-up 320ms cubic-bezier(0.2, 0.9, 0.3, 1) both',
        'fade-in': 'fade-in 200ms ease-out both',
        holo: 'holo 6s linear infinite',
        sheen: 'sheen 3.2s ease-in-out infinite',
        glow: 'glow 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
