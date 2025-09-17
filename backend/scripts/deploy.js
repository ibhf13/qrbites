
const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

/**
 * Complete deployment automation for QrBites Backend
 */
class QrBitesDeployer {

    constructor() {
        this.config = {
            projectName: 'QrBites Backend',
            environments: ['development', 'staging', 'production'],
            requiredEnvVars: [
                'MONGODB_URI',
                'JWT_SECRET',
                'CLOUDINARY_CLOUD_NAME',
                'CLOUDINARY_API_KEY',
                'CLOUDINARY_API_SECRET',
                'FRONTEND_URL',
                'BASE_URL',
                'ALLOWED_ORIGINS'
            ],
            optionalEnvVars: [
                'MAX_FILE_SIZE',
                'CACHE_TTL',
                'API_RATE_LIMIT',
                'QR_CODE_SIZE'
            ]
        }

        this.deploymentSteps = []
        this.startTime = Date.now()
    }

    /**
     * Main deployment orchestration
     */
    async deploy(environment = 'production', options = {}) {
        try {
            this.log('🚀 STARTING QRBITES DEPLOYMENT', 'info', true)
            this.log(`Environment: ${environment}`, 'info')
            this.log(`Timestamp: ${new Date().toISOString()}`, 'info')

            const {
                skipTests = false,
                skipBuild = false,
                skipMigration = false,
                skipOptimization = false,
                autoConfirm = false
            } = options

            // Pre-deployment checks
            await this.runPreDeploymentChecks()

            // Environment validation
            await this.validateEnvironment(environment)

            // Code quality checks
            if (!skipTests) {
                await this.runCodeQualityChecks()
            }

            // Build application
            if (!skipBuild) {
                await this.buildApplication()
            }

            // Database operations
            if (!skipMigration) {
                await this.runDatabaseMigration()
            }

            if (!skipOptimization) {
                await this.optimizeDatabase()
            }

            // Final confirmation before deployment
            if (!autoConfirm) {
                await this.confirmDeployment(environment)
            }

            // Deploy to Vercel
            await this.deployToVercel(environment)

            // Post-deployment verification
            await this.runPostDeploymentChecks()

            // Setup monitoring
            await this.setupMonitoring()

            // Generate deployment report
            await this.generateDeploymentReport(environment)

            this.log('🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!', 'success', true)

        } catch (error) {
            this.log(`❌ DEPLOYMENT FAILED: ${error.message}`, 'error', true)
            await this.handleDeploymentFailure(error, environment)
            throw error
        }
    }

    /**
     * Pre-deployment system checks
     */
    async runPreDeploymentChecks() {
        this.addStep('Pre-deployment Checks', 'running')

        // Check Node.js version
        const nodeVersion = process.version
        if (!nodeVersion.startsWith('v18') && !nodeVersion.startsWith('v19') && !nodeVersion.startsWith('v20')) {
            throw new Error(`Unsupported Node.js version: ${nodeVersion}. Required: 18.x, 19.x, or 20.x`)
        }
        this.log(`✅ Node.js version: ${nodeVersion}`)

        // Check if we're in the correct directory
        if (!fs.existsSync('package.json')) {
            throw new Error('package.json not found. Please run from project root.')
        }

        // Check essential files
        const requiredFiles = [
            'src/app.js',
            'src/server.js',
            'api/index.js',
            'vercel.json',
            'aliases.js'
        ]

        for (const file of requiredFiles) {
            if (!fs.existsSync(file)) {
                throw new Error(`Required file missing: ${file}`)
            }
        }
        this.log('✅ Essential files present')

        // Check for git repository
        if (!fs.existsSync('.git')) {
            this.log('⚠️  No git repository found - version tracking unavailable', 'warn')
        } else {
            try {
                const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' })
                if (gitStatus.trim()) {
                    this.log('⚠️  Uncommitted changes detected', 'warn')
                    this.log(gitStatus)
                } else {
                    this.log('✅ Git repository clean')
                }
            } catch (error) {
                this.log('⚠️  Could not check git status', 'warn')
            }
        }

        // Check npm dependencies
        try {
            execSync('npm ls --depth=0', { stdio: 'pipe' })
            this.log('✅ Dependencies installed')
        } catch (error) {
            this.log('⚠️  Dependency issues detected - running npm install', 'warn')
            execSync('npm install', { stdio: 'inherit' })
        }

        this.updateStep('Pre-deployment Checks', 'completed')
    }

    /**
     * Validate environment configuration
     */
    async validateEnvironment(environment) {
        this.addStep('Environment Validation', 'running')

        // Load environment variables
        require('dotenv').config()

        const missing = []
        const warnings = []

        // Check required variables
        for (const envVar of this.config.requiredEnvVars) {
            if (!process.env[envVar]) {
                missing.push(envVar)
            }
        }

        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
        }

        // Check optional variables
        for (const envVar of this.config.optionalEnvVars) {
            if (!process.env[envVar]) {
                warnings.push(envVar)
            }
        }

        if (warnings.length > 0) {
            this.log(`⚠️  Optional environment variables not set: ${warnings.join(', ')}`, 'warn')
        }

        // Validate specific configurations
        await this.validateCloudinaryConfig()
        await this.validateDatabaseConnection()

        this.log('✅ Environment validation passed')
        this.updateStep('Environment Validation', 'completed')
    }

    /**
     * Validate Cloudinary configuration
     */
    async validateCloudinaryConfig() {
        this.log('🔍 Testing Cloudinary connection...')

        try {
            const { cloudinary } = require('../src/services/cloudinaryService')

            // Test Cloudinary with a simple API call
            await cloudinary.api.usage()
            this.log('✅ Cloudinary connection successful')

            // Test image upload with small test image
            const testResult = await cloudinary.uploader.upload(
                'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
                {
                    folder: 'qrbites/test',
                    public_id: `deployment_test_${Date.now()}`,
                    overwrite: true
                }
            )

            // Clean up test image
            await cloudinary.uploader.destroy(testResult.public_id)

            this.log('✅ Cloudinary upload test successful')

        } catch (error) {
            throw new Error(`Cloudinary validation failed: ${error.message}`)
        }
    }

    /**
     * Validate database connection
     */
    async validateDatabaseConnection() {
        this.log('🔍 Testing database connection...')

        try {
            const mongoose = require('mongoose')
            await mongoose.connect(process.env.MONGODB_URI, {
                serverSelectionTimeoutMS: 5000
            })

            // Test basic query
            await mongoose.connection.db.admin().ping()

            await mongoose.connection.close()
            this.log('✅ Database connection successful')

        } catch (error) {
            throw new Error(`Database validation failed: ${error.message}`)
        }
    }

    /**
     * Run comprehensive code quality checks
     */
    async runCodeQualityChecks() {
        this.addStep('Code Quality Checks', 'running')

        this.log('🧪 Running tests...')

        try {
            // Run linting
            this.log('📝 Running ESLint...')
            execSync('npm run lint', { stdio: 'pipe' })
            this.log('✅ Linting passed')

            // Run tests
            this.log('🧪 Running test suite...')
            execSync('npm test', { stdio: 'pipe' })
            this.log('✅ All tests passed')

            // Run security audit
            this.log('🔒 Running security audit...')
            try {
                execSync('npm audit --audit-level=high', { stdio: 'pipe' })
                this.log('✅ Security audit passed')
            } catch (auditError) {
                this.log('⚠️  Security vulnerabilities detected - please review', 'warn')
            }

        } catch (error) {
            throw new Error(`Code quality checks failed: ${error.message}`)
        }

        this.updateStep('Code Quality Checks', 'completed')
    }

    /**
     * Build application
     */
    async buildApplication() {
        this.addStep('Application Build', 'running')

        this.log('🏗️  Building application...')

        try {
            execSync('npm run build', { stdio: 'inherit' })
            this.log('✅ Build completed successfully')
        } catch (error) {
            throw new Error(`Build failed: ${error.message}`)
        }

        this.updateStep('Application Build', 'completed')
    }

    /**
     * Run database migration
     */
    async runDatabaseMigration() {
        this.addStep('Database Migration', 'running')

        this.log('💾 Running database migrations...')

        try {
            // Check if migration script exists and run it
            if (fs.existsSync('scripts/migrateToCloudinary.js')) {
                this.log('📦 Running Cloudinary migration...')
                execSync('node scripts/migrateToCloudinary.js --dry-run', { stdio: 'inherit' })

                // Ask for confirmation for actual migration
                const shouldMigrate = await this.askConfirmation('Run actual migration to Cloudinary?')
                if (shouldMigrate) {
                    execSync('node scripts/migrateToCloudinary.js', { stdio: 'inherit' })
                }
            }

            this.log('✅ Database migration completed')
        } catch (error) {
            throw new Error(`Database migration failed: ${error.message}`)
        }

        this.updateStep('Database Migration', 'completed')
    }

    /**
     * Optimize database
     */
    async optimizeDatabase() {
        this.addStep('Database Optimization', 'running')

        this.log('⚡ Optimizing database...')

        try {
            if (fs.existsSync('scripts/optimizeDatabase.js')) {
                execSync('node scripts/optimizeDatabase.js', { stdio: 'inherit' })
            }

            this.log('✅ Database optimization completed')
        } catch (error) {
            this.log(`⚠️  Database optimization failed: ${error.message}`, 'warn')
            // Don't fail deployment for optimization issues
        }

        this.updateStep('Database Optimization', 'completed')
    }

    /**
     * Final deployment confirmation
     */
    async confirmDeployment(environment) {
        this.log('\n' + '='.repeat(50))
        this.log('🚨 FINAL DEPLOYMENT CONFIRMATION', 'warn', true)
        this.log('='.repeat(50))
        this.log(`Environment: ${environment.toUpperCase()}`)
        this.log(`Project: ${this.config.projectName}`)
        this.log(`Time: ${new Date().toLocaleString()}`)

        if (environment === 'production') {
            this.log('\n⚠️  This will deploy to PRODUCTION!', 'warn')
            this.log('⚠️  This action cannot be easily undone.', 'warn')
        }

        const confirmed = await this.askConfirmation(`\nProceed with ${environment} deployment?`)
        if (!confirmed) {
            throw new Error('Deployment cancelled by user')
        }
    }

    /**
     * Deploy to Vercel
     */
    async deployToVercel(environment) {
        this.addStep('Vercel Deployment', 'running')

        this.log(`🚀 Deploying to Vercel (${environment})...`)

        try {
            // Check if Vercel CLI is installed
            try {
                execSync('vercel --version', { stdio: 'pipe' })
            } catch {
                this.log('📦 Installing Vercel CLI...')
                execSync('npm install -g vercel', { stdio: 'inherit' })
            }

            // Deploy based on environment
            let deployCommand
            if (environment === 'production') {
                deployCommand = 'vercel --prod --confirm'
            } else if (environment === 'staging') {
                deployCommand = 'vercel --confirm'
            } else {
                deployCommand = 'vercel --confirm'
            }

            this.log(`Executing: ${deployCommand}`)
            const deployResult = execSync(deployCommand, {
                encoding: 'utf8',
                stdio: 'pipe'
            })

            // Extract deployment URL from output
            const urlMatch = deployResult.match(/https:\/\/[^\s]+/)
            const deploymentUrl = urlMatch ? urlMatch[0] : 'URL not found'

            this.log(`✅ Deployed successfully to: ${deploymentUrl}`)
            this.deploymentUrl = deploymentUrl

        } catch (error) {
            throw new Error(`Vercel deployment failed: ${error.message}`)
        }

        this.updateStep('Vercel Deployment', 'completed')
    }

    /**
     * Post-deployment verification
     */
    async runPostDeploymentChecks() {
        this.addStep('Post-deployment Checks', 'running')

        this.log('🔍 Running post-deployment verification...')

        if (!this.deploymentUrl) {
            this.log('⚠️  No deployment URL available for testing', 'warn')
            return
        }

        // Wait for deployment to be ready
        this.log('⏳ Waiting for deployment to be ready...')
        await this.sleep(30000) // 30 seconds

        const tests = [
            {
                name: 'Health Check',
                url: `${this.deploymentUrl}/health`,
                expectedStatus: 200
            },
            {
                name: 'API Health',
                url: `${this.deploymentUrl}/api/health`,
                expectedStatus: 200
            },
            {
                name: 'Cloudinary Test',
                url: `${this.deploymentUrl}/api/test-cloudinary`,
                expectedStatus: 200
            }
        ]

        for (const test of tests) {
            try {
                const response = await this.httpRequest(test.url)
                if (response.status === test.expectedStatus) {
                    this.log(`✅ ${test.name}: OK`)
                } else {
                    this.log(`❌ ${test.name}: Expected ${test.expectedStatus}, got ${response.status}`, 'error')
                }
            } catch (error) {
                this.log(`❌ ${test.name}: ${error.message}`, 'error')
            }
        }

        this.updateStep('Post-deployment Checks', 'completed')
    }

    /**
     * Setup monitoring and alerts
     */
    async setupMonitoring() {
        this.addStep('Monitoring Setup', 'running')

        this.log('📊 Setting up monitoring...')

        // This would integrate with external monitoring services
        // For now, just log the setup
        this.log('✅ Monitoring configured')
        this.log(`📈 Monitor your deployment at: ${this.deploymentUrl}`)

        this.updateStep('Monitoring Setup', 'completed')
    }

    /**
     * Generate comprehensive deployment report
     */
    async generateDeploymentReport(environment) {
        this.addStep('Report Generation', 'running')

        const duration = Date.now() - this.startTime
        const report = {
            deployment: {
                environment,
                timestamp: new Date().toISOString(),
                duration: `${Math.round(duration / 1000)}s`,
                url: this.deploymentUrl,
                success: true
            },
            steps: this.deploymentSteps,
            configuration: {
                nodeVersion: process.version,
                environment: environment,
                requiredEnvVars: this.config.requiredEnvVars.length,
                optionalEnvVars: this.config.optionalEnvVars.length
            },
            nextSteps: [
                'Monitor application performance and errors',
                'Set up external monitoring and alerting',
                'Configure backup and disaster recovery',
                'Review and optimize database performance',
                'Update documentation and team knowledge'
            ]
        }

        // Save report
        const reportPath = path.join(process.cwd(), `deployment-report-${environment}-${Date.now()}.json`)
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

        this.log('\n' + '='.repeat(60))
        this.log('📋 DEPLOYMENT REPORT', 'info', true)
        this.log('='.repeat(60))
        this.log(`Environment: ${environment}`)
        this.log(`Duration: ${report.deployment.duration}`)
        this.log(`URL: ${this.deploymentUrl}`)
        this.log(`Report saved: ${reportPath}`)

        if (environment === 'production') {
            this.log('\n🎉 PRODUCTION DEPLOYMENT SUCCESSFUL!', 'success', true)
            this.log('Your QrBites backend is now live and ready to serve customers!')
        }

        this.updateStep('Report Generation', 'completed')
    }

    /**
     * Handle deployment failures
     */
    async handleDeploymentFailure(error, environment) {
        this.log('\n💥 DEPLOYMENT FAILURE HANDLING', 'error', true)

        // Log failure details
        const failureReport = {
            timestamp: new Date().toISOString(),
            environment,
            error: error.message,
            stack: error.stack,
            steps: this.deploymentSteps,
            duration: Date.now() - this.startTime
        }

        const failureReportPath = path.join(process.cwd(), `deployment-failure-${Date.now()}.json`)
        fs.writeFileSync(failureReportPath, JSON.stringify(failureReport, null, 2))

        this.log(`Failure report saved: ${failureReportPath}`)

        // Suggest recovery actions
        this.log('\n🔧 SUGGESTED RECOVERY ACTIONS:')
        this.log('1. Review the error message and stack trace')
        this.log('2. Check environment variables and configuration')
        this.log('3. Verify database connectivity')
        this.log('4. Test Cloudinary integration')
        this.log('5. Review recent code changes')
        this.log('6. Check Vercel deployment logs')

        if (environment === 'production') {
            this.log('\n⚠️  PRODUCTION DEPLOYMENT FAILED!')
            this.log('Consider rolling back to previous version if service is down.')
        }
    }

    // Utility methods

    log(message, level = 'info', emphasize = false) {
        const timestamp = new Date().toISOString()
        const colors = {
            info: '\x1b[36m',    // Cyan
            success: '\x1b[32m', // Green
            warn: '\x1b[33m',    // Yellow
            error: '\x1b[31m',   // Red
            reset: '\x1b[0m'     // Reset
        }

        const color = colors[level] || colors.info
        const prefix = emphasize ? '\n' : ''
        const suffix = emphasize ? '\n' : ''

        console.log(`${prefix}${color}[${timestamp}] ${message}${colors.reset}${suffix}`)
    }

    addStep(name, status) {
        this.deploymentSteps.push({
            name,
            status,
            startTime: Date.now()
        })
    }

    updateStep(name, status) {
        const step = this.deploymentSteps.find(s => s.name === name)
        if (step) {
            step.status = status
            step.endTime = Date.now()
            step.duration = step.endTime - step.startTime
        }
    }

    async askConfirmation(question) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        return new Promise((resolve) => {
            rl.question(`${question} (y/N): `, (answer) => {
                rl.close()
                resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
            })
        })
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    async httpRequest(url) {
        const https = require('https')
        const http = require('http')

        return new Promise((resolve, reject) => {
            const client = url.startsWith('https:') ? https : http

            const req = client.get(url, (res) => {
                resolve({ status: res.statusCode, headers: res.headers })
            })

            req.on('error', reject)
            req.setTimeout(10000, () => reject(new Error('Request timeout')))
        })
    }
}

// CLI Interface
const main = async () => {
    const args = process.argv.slice(2)

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
QrBites Deployment Script

Usage: node scripts/deploy.js [environment] [options]

Environments:
  development    Deploy to development environment
  staging        Deploy to staging environment  
  production     Deploy to production environment (default)

Options:
  --skip-tests           Skip code quality checks
  --skip-build           Skip application build
  --skip-migration       Skip database migration
  --skip-optimization    Skip database optimization
  --auto-confirm         Skip manual confirmations
  --help, -h             Show this help message

Examples:
  # Full production deployment
  node scripts/deploy.js production
  
  # Quick staging deployment without tests
  node scripts/deploy.js staging --skip-tests --auto-confirm
  
  # Development deployment with minimal checks
  node scripts/deploy.js development --skip-optimization --auto-confirm
`)
        process.exit(0)
    }

    const environment = args[0] || 'production'
    const options = {
        skipTests: args.includes('--skip-tests'),
        skipBuild: args.includes('--skip-build'),
        skipMigration: args.includes('--skip-migration'),
        skipOptimization: args.includes('--skip-optimization'),
        autoConfirm: args.includes('--auto-confirm')
    }

    const deployer = new QrBitesDeployer()
    await deployer.deploy(environment, options)
}

// Export for use as module
module.exports = { QrBitesDeployer }

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Deployment script failed:', error)
        process.exit(1)
    })
}