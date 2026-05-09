import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'fo-navy': '#0a2540',
        'fo-primary': '#0066ff',
        'fo-primary-dark': '#0047b3',
        'fo-primary-light': '#e6f0ff',
        'fo-accent': '#00c2ff',
        'fo-text': '#1e293b',
        'fo-text-secondary': '#64748b',
        'fo-text-muted': '#94a3b8',
        'fo-bg': '#f8fafc',
        'fo-surface': '#ffffff',
        'fo-border': '#e2e8f0',
        'fo-border-subtle': '#f1f5f9',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
