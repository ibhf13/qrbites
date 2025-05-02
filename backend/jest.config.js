module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./tests/setup.js'],
    testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    testTimeout: 30000, // Increase timeout to 30 seconds
    moduleNameMapper: {
        '^@src/(.*)$': '<rootDir>/src/$1',
        '^@models/(.*)$': '<rootDir>/src/models/$1',
        '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
        '^@routes/(.*)$': '<rootDir>/src/routes/$1',
        '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
        '^@validations/(.*)$': '<rootDir>/src/validations/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@config/(.*)$': '<rootDir>/src/config/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@tests/(.*)$': '<rootDir>/tests/$1',
        '^@mocks/(.*)$': '<rootDir>/tests/fixtures/mocks/$1',
        '^@seeders/(.*)$': '<rootDir>/tests/seeders/$1',
        '^@app$': '<rootDir>/src/app.js'
    },
    testPathIgnorePatterns: [
        '/node_modules/'
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/tests/'
    ]
} 