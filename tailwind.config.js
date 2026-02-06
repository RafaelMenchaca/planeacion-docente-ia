/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './**/*.html',
    './src/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          soft: '#DBEAFE',
        },
        background: '#F8FAFC',
        surface: '#FFFFFF',
        muted: '#F1F5F9',
        text: {
          main: '#0F172A',
          muted: '#64748B',
          inverse: '#FFFFFF',
        },
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        sm: '0.375rem', // 6px
        md: '0.5rem',   // 8px
        lg: '0.75rem',  // 12px
        xl: '1rem',     // 16px
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 6px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
