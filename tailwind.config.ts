import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './inertia/**/*.{ts,tsx}',
    './resources/views/**/*.edge',
  ],
  theme: {
    extend: {
      colors: {
        custom: {
          black: '#000000',
          orange: '#FF9900',
          darkGray: '#222222',
          mediumGray: '#333333',
          lightGray: '#CCCCCC',
        },
      },
    },
  },
  plugins: [],
}

export default config
