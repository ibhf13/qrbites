const path = require('path')

// Helper function to log the files being processed
const logFiles = (category, files) => {
    console.log(`\n📝 ${category}:`)
    files.forEach((file) => console.log(`   - ${file}`))
    console.log('')
}

module.exports = {
    // Backend JavaScript files
    'backend/**/*.{js,jsx}': (filenames) => {
        console.log('\n🔧 Processing Backend files...')
        logFiles('Backend JS/JSX files', filenames)

        const backendFiles = filenames
            .map((f) => path.relative('backend', f))
            .map((f) => f.replace(/\\/g, '/'))
            .join(' ')

        const absoluteFiles = filenames.map((f) => f.replace(/\\/g, '/')).join(' ')

        return [
            `echo "🔍 Running ESLint on backend files..." && cd backend && npx eslint --fix ${backendFiles}`,
            `echo "✨ Running Prettier on backend files..." && cd backend && npx prettier --write ${backendFiles}`,
            `echo "📝 Adding fixed files to staging..." && git add ${absoluteFiles}`,
        ]
    },

    // Frontend TypeScript/JavaScript files
    'frontend/**/*.{ts,tsx,js,jsx}': (filenames) => {
        console.log('\n⚛️  Processing Frontend files...')
        logFiles('Frontend TS/TSX/JS/JSX files', filenames)

        const frontendFiles = filenames
            .map((f) => path.relative('frontend', f))
            .map((f) => f.replace(/\\/g, '/'))
            .join(' ')

        const absoluteFiles = filenames.map((f) => f.replace(/\\/g, '/')).join(' ')

        return [
            `echo "🔍 Running ESLint on frontend files..." && cd frontend && npx eslint --fix ${frontendFiles}`,
            `echo "✨ Running Prettier on frontend files..." && cd frontend && npx prettier --write ${frontendFiles}`,
            `echo "📝 Adding fixed files to staging..." && git add ${absoluteFiles}`,
        ]
    },

    // JSON, Markdown, YAML files
    '*.{json,md,yml,yaml}': (filenames) => {
        console.log('\n📄 Processing Config/Doc files...')
        logFiles('JSON/Markdown/YAML files', filenames)

        const files = filenames.map((f) => f.replace(/\\/g, '/')).join(' ')
        return [
            `echo "✨ Running Prettier on config/doc files..." && npx prettier --write ${files}`,
            `echo "📝 Adding formatted files to staging..." && git add ${files}`,
        ]
    },
};

