
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.css",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: '#fef9ec',
        'on-surface': '#1d1c14',
        'on-surface-variant': '#3f4940',
        'surface-container': '#f2eee1',
        'surface-container-low': '#f8f3e6',
        'surface-container-high': '#ede8db',
        'surface-container-highest': '#e7e2d6',
        'surface-container-lowest': '#ffffff',
        'surface-variant': '#e7e2d6',
        'outline-variant': '#becabd',
        outline: '#6f7a6f',
        primary: '#005126',
        'primary-container': '#006c35',
        'on-primary': '#ffffff',
        'on-primary-container': '#90eaa5',
        secondary: '#755b00',
        'on-secondary': '#ffffff',
        'on-secondary-fixed': '#241a00',
        'tertiary-container': '#c6a94e',
        'on-tertiary-fixed': '#231b00',
        tertiary: '#735c00',
        'tertiary-fixed': '#ffe084',
        error: '#ba1a1a',
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8C96A',
          dark: '#A07828',
        },
        saudiGreen: {
          DEFAULT: '#006c35',
          light: '#00924A',
          dark: '#005126',
        },
        sand: {
          DEFAULT: '#f8f3e6',
          light: '#fef9ec',
          dark: '#e7e2d6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Cairo', 'system-ui', 'sans-serif'],
        headline: ['Inter', 'Cairo', 'sans-serif'],
        body: ['Inter', 'Cairo', 'sans-serif'],
        arabic: ['Cairo', 'Noto Kufi Arabic', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A84C 0%, #E8C96A 100%)',
        'green-gradient': 'linear-gradient(135deg, #005126 0%, #006c35 100%)',
        'hero-pattern': "url('/patterns/geometric.svg')",
      },
      boxShadow: {
        majlis: '0 12px 40px rgba(0, 0, 0, 0.04)',
        card: '0 12px 40px rgba(0, 0, 0, 0.02)',
        gold: '0 4px 20px rgba(201, 168, 76, 0.25)',
        'gold-lg': '0 8px 40px rgba(201, 168, 76, 0.35)',
        green: '0 4px 20px rgba(0, 108, 53, 0.25)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
