import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
        accent: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          light: '#dbeafe',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            fontFamily: 'Lora, Georgia, serif',
            maxWidth: '70ch',
            lineHeight: '1.85',
            fontSize: '1.125rem',
            'h1, h2, h3': { fontFamily: 'Inter, system-ui, sans-serif', fontWeight: '700' },
            a: { color: '#2563eb', textDecoration: 'underline' },
            code: { fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875em' },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
