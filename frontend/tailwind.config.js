/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f6ff',
                    100: '#dbeafe',
                    200: '#a5b4fc',
                    300: '#6366f1',
                    400: '#4338ca',
                    500: '#312e81',
                    600: '#1e1b4b',
                },
                secondary: {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#c4b5fd',
                    300: '#a78bfa',
                    400: '#7c3aed',
                    500: '#5b21b6',
                    600: '#3c096c',
                },
                accent: {
                    50: '#fffbe6',
                    100: '#fff3bf',
                    200: '#ffe066',
                    300: '#ffd60a',
                    400: '#fab005',
                    500: '#e67700',
                    600: '#a96f00',
                },
                neutral: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#334155',
                },
                success: '#22c55e',
                warning: '#fbbf24',
                error: '#ef4444',
                info: '#3b82f6',
            },
            fontFamily: {
                sans: ['Inter var', 'Inter', 'sans-serif'],
                display: ['Poppins', 'sans-serif'],
            },
            fontSize: {
                xs: ['0.75rem', { lineHeight: '1rem' }],
                sm: ['0.875rem', { lineHeight: '1.25rem' }],
                base: ['1rem', { lineHeight: '1.5rem' }],
                lg: ['1.125rem', { lineHeight: '1.75rem' }],
                xl: ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
                '5xl': ['3rem', { lineHeight: '1' }],
            },
            spacing: {
                '4.5': '1.125rem',
                '13': '3.25rem',
                '72': '18rem',
                '84': '21rem',
                '96': '24rem',
            },
            borderRadius: {
                '4xl': '2rem',
            },
            boxShadow: {
                glass: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
                card: '0 4px 24px 0 rgba(60, 72, 100, 0.08)',
                hover: '0 8px 32px 0 rgba(60, 72, 100, 0.16)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'pulse-subtle': 'pulseSubtle 2s infinite',
                'bounce-subtle': 'bounceSubtle 1s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                pulseSubtle: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.8' },
                },
                bounceSubtle: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
            },
            transitionTimingFunction: {
                'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                'slide': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                'emphasis': 'cubic-bezier(0.17, 0.67, 0.83, 0.67)',
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                'gradient-accent': 'linear-gradient(135deg, #ffd60a 0%, #fab005 100%)',
                'glass': 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(245,245,255,0.5) 100%)',
            },
            backdropBlur: {
                glass: '8px',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        require('@tailwindcss/aspect-ratio'),
    ],
} 