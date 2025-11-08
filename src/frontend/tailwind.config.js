// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // This array is CRITICAL for finding your styles
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}