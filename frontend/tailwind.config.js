/** @type {import('tailwindcss').Config} */

// DHotels brand: "Midnight & Brass".
// - gray    -> midnight ink (cool, slightly green-tinted neutrals) used for every surface and text tone
// - primary -> brass, the single accent; 400 for text/lines on dark, 500+ for solid fills with white text
// - secondary -> champagne copper, only for gradient partners next to brass
const ink = {
  50:  '#F4F6F5',
  100: '#E9EDEC',
  200: '#D3DAD9',
  300: '#AEB9B8',
  400: '#8796A0',
  500: '#5D6D74',
  600: '#3B4A50',
  700: '#26343A',
  800: '#18242A',
  850: '#131D22',
  900: '#0E171B',
  950: '#091013',
};

const brass = {
  50:  '#FBF7EE',
  100: '#F5EBD2',
  200: '#EBD7A6',
  300: '#DFC07A',
  400: '#C9A25A',
  500: '#A07A34',
  600: '#86652B',
  700: '#6B5023',
  800: '#4F3B1B',
  900: '#342713',
};

const copper = {
  50:  '#FBF3EE',
  100: '#F4E2D6',
  200: '#E8C3AA',
  300: '#D9A27F',
  400: '#C4835A',
  500: '#A66A43',
  600: '#875536',
  700: '#69422B',
  800: '#4C3020',
  900: '#311F15',
};

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        gray: ink,
        ink,
        primary: brass,
        brass,
        secondary: copper,
        ethereal: {
          primary: brass[400],
          'primary-container': brass[500],
          secondary: copper[400],
          'secondary-container': brass[200],
          surface: ink[900],
          'surface-low': ink[850],
          'surface-lowest': ink[800],
          'on-surface': ink[50],
          'on-surface-variant': ink[300],
          'outline-variant': ink[700],
        }
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        ambient: '0 24px 48px -12px rgba(0, 0, 0, 0.55)',
        card: '0 1px 0 0 rgba(255, 255, 255, 0.04) inset, 0 12px 32px -16px rgba(0, 0, 0, 0.6)',
        brass: '0 10px 30px -10px rgba(201, 162, 90, 0.45)',
      },
      letterSpacing: {
        eyebrow: '0.22em',
      },
      maxWidth: {
        site: '80rem',
      },
    },
  },
  plugins: [],
}
