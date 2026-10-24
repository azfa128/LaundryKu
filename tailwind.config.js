/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ocean: '#087E8B', teal: '#16A6A1', ink: '#14343B', muted: '#668087',
        mist: '#EAF7F7', line: '#D8E8E9', express: '#FFD45A', white: '#FFFFFF',
        status: { success: '#16764D', successBg: '#D9F3E9', pickup: '#1760A5', pickupBg: '#DCEEFF' },
      },
      fontFamily: { heading: ['Manrope', 'sans-serif'], sans: ['DM Sans', 'sans-serif'], mono: ['Geist Mono', 'monospace'] },
      borderRadius: { token: '12px' },
      spacing: { 1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '20px', 6: '24px', 8: '32px' },
    },
  },
  plugins: [],
};
