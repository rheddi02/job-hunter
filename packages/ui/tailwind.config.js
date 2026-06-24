/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {
      colors: {
        background: '#111113',
        surface: '#1c1c1f',
        border: '#2e2e32',
        'text-primary': '#f4f4f5',
        'text-secondary': '#a1a1aa',
        accent: '#3b82f6',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        status: {
          matched: '#64748b',
          drafted: '#f59e0b',
          applied: '#6366f1',
          interviewing: '#8b5cf6',
          rejected: '#ef4444',
          ghosted: '#71717a',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.375rem',
        none: '0',
        sm: '0.375rem',
        md: '0.375rem',
        lg: '0.375rem',
        xl: '0.375rem',
        '2xl': '0.375rem',
        full: '9999px',
      },
      boxShadow: {
        DEFAULT: 'none',
        sm: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        '2xl': 'none',
        inner: 'none',
      },
    },
  },
  plugins: [],
}
