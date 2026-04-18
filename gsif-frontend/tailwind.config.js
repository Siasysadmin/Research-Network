/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // This allows us to force dark mode
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      },
      colors: {
        primary: '#00ff88',
        'primary-alt': '#0df287',
        'background-dark': '#0a1510',
        'card-dark': '#142920',
        'border-dark': '#224937',
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "1rem",
        "full": "9999px"
      },
      backgroundImage: {
        'geometric-overlay': `linear-gradient(30deg, rgba(251, 146, 60, 0.03) 12%, transparent 12.5%, transparent 87%, rgba(251, 146, 60, 0.03) 87.5%, rgba(251, 146, 60, 0.03)),
                               linear-gradient(150deg, rgba(251, 146, 60, 0.03) 12%, transparent 12.5%, transparent 87%, rgba(251, 146, 60, 0.03) 87.5%, rgba(251, 146, 60, 0.03))`,
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}