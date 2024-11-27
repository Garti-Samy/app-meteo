/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./dist/**/*.{html,js,php}",],
  theme: {
    extend: {
      colors: {
        'primary': '#1E1E1E',
        'bodycolor': '#363636',
        'single': '#272727',
        'secondary': '#353535',
        'dark': '#222',
        'light': '#f4f4f4',
        'danger': '#ff0000',
      },

      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}