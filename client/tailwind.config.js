/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7f3',
          100: '#d9ebdf',
          200: '#b4d7c0',
          300: '#8cc49f',
          400: '#63b07c',
          500: '#1e7f43',
          600: '#196f3a',
          700: '#145c30',
          800: '#0f4926',
          900: '#0a351c',
        },
        secondary: {
          50: '#fff8e6',
          100: '#feefcc',
          200: '#fcdfa3',
          300: '#facc7a',
          400: '#f7b353',
          500: '#f59e0b',
          600: '#dd8c0a',
          700: '#b57208',
          800: '#8c5806',
          900: '#5c3a04',
        },
        success: '#22c55e',
        warning: '#facc15',
        danger: '#ef4444',
        info: '#3b82f6',
        surface: '#ffffff',
        background: '#f4f6f8',
      },
      fontFamily: {
        sans: ['"Manrope"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Manrope"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'brand-card': '0 10px 40px rgba(16, 94, 52, 0.08)',
      },
    },
  },
  plugins: [],
};

