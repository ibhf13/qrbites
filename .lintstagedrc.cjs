const path = require('path')

module.exports = {
    // Backend JavaScript files
    'backend/**/*.{js,jsx}': (filenames) => {
        const backendFiles = filenames
            .map((f) => path.relative('backend', f))
            .map((f) => f.replace(/\\/g, '/'))
            .join(' ')
        return [
            `cd backend && npx eslint --fix ${backendFiles}`,
            `cd backend && npx prettier --write ${backendFiles}`,
        ]
    },

    // Frontend TypeScript/JavaScript files
    'frontend/**/*.{ts,tsx,js,jsx}': (filenames) => {
        const frontendFiles = filenames
            .map((f) => path.relative('frontend', f))
            .map((f) => f.replace(/\\/g, '/'))
            .join(' ')
        return [
            `cd frontend && npx eslint --fix ${frontendFiles}`,
            `cd frontend && npx prettier --write ${frontendFiles}`,
        ]
    },

    // JSON, Markdown, YAML files
    '*.{json,md,yml,yaml}': (filenames) => {
        const files = filenames.map((f) => f.replace(/\\/g, '/')).join(' ')
        return [`npx prettier --write ${files}`]
    },
};

