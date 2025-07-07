/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        netflix: {
          red: '#dc2626',
          dark: '#b91c1c',
          darker: '#991b1b',
          black: '#000000',
          gray: {
            900: '#1a1a1a',
            800: '#2a2a2a',
            700: '#3a3a3a',
            600: '#4a4a4a',
            500: '#5a5a5a',
            400: '#6a6a6a',
            300: '#9a9a9a',
            200: '#bfbfbf',
            100: '#e5e5e5',
          }
        }
      },
      fontFamily: {
        'sans': ['Netflix Sans', 'Helvetica Neue', 'Segoe UI', 'Roboto', 'Ubuntu', 'sans-serif'],
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      aspectRatio: {
        '2/3': '2 / 3',
        '16/9': '16 / 9',
        '4/3': '4 / 3',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-in': 'slideIn 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'netflix': '0 10px 25px rgba(0, 0, 0, 0.3)',
        'netflix-lg': '0 20px 50px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}