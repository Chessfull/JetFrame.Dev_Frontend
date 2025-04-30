/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF6B00", // Orange
        secondary: "#FFA559", // Lighter orange
        accent: "#FFD6A5", // Very light orange
        dark: "#191919", // Near black
        darkGray: "#2D2D2D", // Dark gray
        mediumGray: "#3D3D3D" // Medium gray
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wing-spread': 'wing-spread 5s ease-in-out infinite',
        'wing-flow': 'wing-flow 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'wing-spread': {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.05) rotate(3deg)' },
        },
        'wing-flow': {
          '0%': { transform: 'translateX(0) translateY(0) rotate(0deg)', opacity: '0.3' },
          '25%': { transform: 'translateX(10px) translateY(-5px) rotate(3deg)', opacity: '0.5' },
          '50%': { transform: 'translateX(5px) translateY(-10px) rotate(0deg)', opacity: '0.3' },
          '75%': { transform: 'translateX(-5px) translateY(-5px) rotate(-3deg)', opacity: '0.5' },
          '100%': { transform: 'translateX(0) translateY(0) rotate(0deg)', opacity: '0.3' },
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 15px rgba(255, 107, 0, 0.5)',
        'wing-glow': '0 0 25px rgba(255, 107, 0, 0.4)',
      },
    },
  },
  plugins: [],
} 