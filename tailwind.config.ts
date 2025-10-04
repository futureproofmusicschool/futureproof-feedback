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
          purple: '#5628A1',
          'purple-light': '#A373F8',
          gray: '#BBBDC5',
        },
        bg: {
          dark: '#111111',
          medium: '#222222',
          light: '#444444',
        },
        text: {
          light: '#F6F8FF',
        }
      }
    },
  },
  plugins: [],
};
export default config;

