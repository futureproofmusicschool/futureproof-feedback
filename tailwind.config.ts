import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Source Sans Pro', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#000000',
          purple: '#8B5CF6',
          'purple-light': '#A78BFA',
          'purple-bright': '#C084FC',
          'purple-dark': '#6D28D9',
          gray: '#9CA3AF',
        },
        bg: {
          dark: '#0A0A0F',
          medium: '#1A1A2E',
          light: '#252538',
        },
        text: {
          light: '#F9FAFB',
        }
      },
      boxShadow: {
        'purple-glow': '0 0 15px rgba(139, 92, 246, 0.3)',
        'purple-glow-lg': '0 0 25px rgba(139, 92, 246, 0.4)',
      }
    },
  },
  plugins: [],
};
export default config;

