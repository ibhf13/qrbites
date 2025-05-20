const designTokens = require('./src/styles/designTokens.ts')

module.exports = {
    darkMode: designTokens.tailwindConfig.darkMode,
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
        '!./src/**/*.test.{js,ts,jsx,tsx}',
        '!./src/**/*.spec.{js,ts,jsx,tsx}',
        '!./src/**/*.stories.{js,ts,jsx,tsx}'
    ],
    theme: {
        extend: {
            colors: designTokens.colors,
            fontFamily: designTokens.typography.fontFamily,
            fontSize: designTokens.typography.fontSize,
            fontWeight: designTokens.typography.fontWeight,
            lineHeight: designTokens.typography.lineHeight,
            letterSpacing: designTokens.typography.letterSpacing,
            spacing: designTokens.spacing,
            borderRadius: designTokens.borderRadius,
            boxShadow: designTokens.shadows,
            transitionTimingFunction: designTokens.transitions,
            backdropBlur: designTokens.backdropBlur,
            keyframes: designTokens.keyframes,
            animation: designTokens.animation
        }
    },
    safelist: designTokens.safelist,
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        require('@tailwindcss/aspect-ratio')
    ]
}
