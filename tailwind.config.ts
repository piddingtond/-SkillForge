import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'sf-bg': {
          0: '#08080E',
          1: '#0F0F1A',
          2: '#15151F',
          3: '#1C1C28',
        },
        'sf-border': '#252535',
        'sf-violet': {
          DEFAULT: '#7C3AED',
          deep: '#5B21B6',
          light: '#A855F7',
        },
        'sf-cyan': {
          DEFAULT: '#06B6D4',
          deep: '#0891B2',
        },
        'sf-emerald': '#10B981',
        'sf-amber': '#F59E0B',
        'sf-text': {
          1: '#F8F8FF',
          2: '#C4C4D4',
          3: '#8884A0',
          4: '#555570',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'sf-gradient': 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
      },
      maxWidth: {
        'sf': '1280px',
      },
    },
  },
  plugins: [],
};
export default config;
