/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#ffeed1',
          100: '#ffd499',
          200: '#ffb966',
          300: '#f7b538',
          400: '#db7c26',
          500: '#d8572a',
          600: '#c32f27',
          700: '#9c1c1f',
          800: '#780116',
          900: '#4a000d',
        },
        secondary: {
          50:  '#ffeed1',
          100: '#ffd499',
          200: '#ffb966',
          300: '#f7b538',
          400: '#db7c26',
          500: '#d8572a',
          600: '#c32f27',
          700: '#9c1c1f',
          800: '#780116',
          900: '#4a000d',
        },
        ethereal: {
          primary: '#db7c26',
          'primary-container': '#d8572a',
          secondary: '#d8572a',
          'secondary-container': '#f7b538',
          surface: '#121212',
          'surface-low': '#1e1e1e',
          'surface-lowest': '#2a2a2a',
          'on-surface': '#f5f5f5',
          'on-surface-variant': '#c2c2c2',
          'outline-variant': '#525252',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'ambient': '0 20px 40px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
