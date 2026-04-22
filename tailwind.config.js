/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f6ba8',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#e6f0f7',
          foreground: '#12324a',
        },
        danger: {
          DEFAULT: '#c73d3d',
          foreground: '#ffffff',
        },
        success: {
          DEFAULT: '#1f8f63',
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: '#b97717',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#f2f7fb',
          foreground: '#12324a',
        },
        input: '#d7e3ee',
      },
    },
  },
  plugins: [],
}
