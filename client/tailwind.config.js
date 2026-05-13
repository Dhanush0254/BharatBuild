/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#f59e0b', // Amber 500
        'brand-hover': '#d97706', // Amber 600
        surface: '#ffffff',
        'surface-raised': '#f8fafc', // Slate 50
        border: '#e2e8f0', // Slate 200
        'border-muted': '#f1f5f9', // Slate 100
        'text-primary': '#0f172a', // Slate 900
        'text-secondary': '#475569', // Slate 600
        'text-muted': '#94a3b8', // Slate 400
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
