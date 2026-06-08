import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

/**
 * IndusAI Design System — Dark-First Premium Hybrid.
 * Semantic tokens (background/foreground/primary…) are HSL CSS vars in globals.css
 * so Shadcn primitives work. Brand tokens (bg.*, gold.*) are the raw design palette.
 */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        /* ─── Shadcn semantic tokens (HSL via CSS vars) ─── */
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        /* ─── Brand palette (raw hex from design strategy) ─── */
        bg: {
          base: '#0D0D0F',
          surface: '#161618',
          elevated: '#1F1F22',
          overlay: '#2A2A2E',
        },
        gold: {
          dim: '#C9902A',
          base: '#E4A93A',
          bright: '#F5C054',
          glow: '#FDD98A',
        },
        success: '#2ECC71',
        error: '#E74C3C',
        warning: '#F39C12',
        info: '#3498DB',
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        ui: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        xs: ['11px', { lineHeight: '1.4' }],
        sm: ['13px', { lineHeight: '1.5' }],
        base: ['15px', { lineHeight: '1.6' }],
        md: ['17px', { lineHeight: '1.5' }],
        lg: ['20px', { lineHeight: '1.4' }],
        xl: ['24px', { lineHeight: '1.3' }],
        '2xl': ['32px', { lineHeight: '1.2' }],
        '3xl': ['48px', { lineHeight: '1.1' }],
        '4xl': ['64px', { lineHeight: '1.0' }],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
        '2xl': '28px',
      },
      boxShadow: {
        'elev-1': '0 1px 3px rgba(0,0,0,0.4)',
        'elev-2': '0 4px 16px rgba(0,0,0,0.5)',
        'elev-3': '0 8px 32px rgba(0,0,0,0.6)',
        'elev-4': '0 16px 64px rgba(0,0,0,0.7)',
        'gold-glow': '0 0 24px rgba(228,169,58,0.35)',
      },
      backdropBlur: {
        glass: '12px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'orb-float': {
          '0%, 100%': { transform: 'scale(1) translate(0, 0)' },
          '50%': { transform: 'scale(1.15) translate(20px, -20px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 1.5s infinite',
        'orb-float': 'orb-float 8s ease-in-out infinite',
      },
    },
  },
  plugins: [animate],
} satisfies Config;
