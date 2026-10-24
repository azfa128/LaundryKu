/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ocean: '#1F1F2E', teal: '#D6F55F', ink: '#1F1F2E', muted: 'rgba(31,31,46,0.62)',
        mist: '#E3E0FA', line: 'rgba(31,31,46,0.12)', express: '#D6F55F', white: '#FFFFFF',
        ground: '#F5F5F1', card: '#FFFFFF', peach: '#FDE3D3', lavender: '#E3E0FA', softlime: '#E8F7C0', sidebar: '#232235',
        status: { success: '#1F1F2E', successBg: '#E8F7C0', pickup: '#1F1F2E', pickupBg: '#FDE3D3' },
      },
      fontFamily: { heading: ['Manrope', 'sans-serif'], sans: ['DM Sans', 'sans-serif'], mono: ['Geist Mono', 'monospace'] },
      borderRadius: { token: '20px' },
      boxShadow: { soft: '0 8px 24px -14px rgba(31,31,46,0.24)', card: '0 12px 32px -20px rgba(31,31,46,0.22)' },
      spacing: { 1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '20px', 6: '24px', 8: '32px', 'ds-inset': '12px', 'ds-control': '16px', 'ds-frame': '30px' },
    },
  },
  plugins: [],
};
