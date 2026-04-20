import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#031119',
        teal: '#01B4AF',
        gold: '#FFB100',
      },
    },
  },
  plugins: [],
}

export default config
