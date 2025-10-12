#!/usr/bin/env node
/**
 * Swagger Specification Validation Script
 * Validates the OpenAPI/Swagger specification and generates a JSON file
 */

/* eslint-disable */
require('module-alias/register')
const fs = require('fs')
const path = require('path')
const swaggerSpec = require('../src/config/swagger')

// ANSI color codes for better output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
}

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    header: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`),
}

/**
 * Validate the Swagger specification
 */
function validateSwagger() {
    log.header('🔍 Validating Swagger/OpenAPI Specification')
    console.log('')

    let hasErrors = false

    // Check if spec was generated
    if (!swaggerSpec || typeof swaggerSpec !== 'object') {
        log.error('Invalid Swagger specification - spec is not an object')
        process.exit(1)
    }

    // Validate required fields
    const requiredFields = ['openapi', 'info', 'paths']
    requiredFields.forEach((field) => {
        if (!swaggerSpec[field]) {
            log.error(`Missing required field: ${field}`)
            hasErrors = true
        } else {
            log.success(`Required field present: ${field}`)
        }
    })

    // Validate OpenAPI version
    if (swaggerSpec.openapi) {
        const version = swaggerSpec.openapi
        if (!version.startsWith('3.')) {
            log.warning(`Using OpenAPI version ${version} - consider upgrading to 3.x`)
        } else {
            log.success(`OpenAPI Version: ${version}`)
        }
    }

    // Validate info object
    if (swaggerSpec.info) {
        const { title, version, description } = swaggerSpec.info
        log.success(`API Title: ${title}`)
        log.success(`API Version: ${version}`)
        if (description) {
            log.success(`Description length: ${description.length} characters`)
        }
    }

    // Count and validate paths
    const pathCount = Object.keys(swaggerSpec.paths || {}).length
    if (pathCount === 0) {
        log.warning('No API paths found - this might indicate documentation is missing')
    } else {
        log.success(`API Paths: ${pathCount} endpoints documented`)
    }

    // Count schemas
    const schemaCount = Object.keys(swaggerSpec.components?.schemas || {}).length
    log.success(`Schemas: ${schemaCount} data models defined`)

    // Count reusable responses
    const responseCount = Object.keys(swaggerSpec.components?.responses || {}).length
    log.success(`Reusable Responses: ${responseCount} response types`)

    // Count reusable parameters
    const parameterCount = Object.keys(swaggerSpec.components?.parameters || {}).length
    log.success(`Reusable Parameters: ${parameterCount} parameter definitions`)

    // Validate tags
    const tags = swaggerSpec.tags || []
    if (tags.length > 0) {
        log.success(`Tags: ${tags.length} categories defined`)
        tags.forEach((tag) => {
            log.info(`  - ${tag.name}${tag.description ? `: ${tag.description}` : ''}`)
        })
    }

    // Validate servers
    const servers = swaggerSpec.servers || []
    if (servers.length > 0) {
        log.success(`Servers: ${servers.length} server(s) configured`)
        servers.forEach((server) => {
            log.info(`  - ${server.description || 'Server'}: ${server.url}`)
        })
    }

    // Check for security schemes
    const securitySchemes = swaggerSpec.components?.securitySchemes || {}
    if (Object.keys(securitySchemes).length > 0) {
        log.success(`Security Schemes: ${Object.keys(securitySchemes).join(', ')}`)
    }

    // Validate each path for common issues
    log.header('\n📋 Validating Paths')
    let pathWarnings = 0
    Object.entries(swaggerSpec.paths || {}).forEach(([path, methods]) => {
        Object.entries(methods).forEach(([method, operation]) => {
            if (!operation.summary) {
                log.warning(`${method.toUpperCase()} ${path} - missing summary`)
                pathWarnings++
            }
            if (!operation.responses) {
                log.warning(`${method.toUpperCase()} ${path} - missing responses`)
                pathWarnings++
            }
            if (!operation.tags || operation.tags.length === 0) {
                log.warning(`${method.toUpperCase()} ${path} - missing tags`)
                pathWarnings++
            }
        })
    })

    if (pathWarnings === 0) {
        log.success('All paths have required documentation')
    } else {
        log.warning(`${pathWarnings} path documentation warnings`)
    }

    // Save the spec to a file
    log.header('\n💾 Saving Swagger Specification')
    const outputPath = path.join(__dirname, '../docs/swagger.json')
    const outputDir = path.dirname(outputPath)

    try {
        // Create docs directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true })
            log.success(`Created directory: ${outputDir}`)
        }

        // Write the spec file
        fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2), 'utf8')
        log.success(`Swagger spec saved to: ${outputPath}`)

        // Get file size
        const stats = fs.statSync(outputPath)
        const fileSizeKB = (stats.size / 1024).toFixed(2)
        log.info(`File size: ${fileSizeKB} KB`)
    } catch (error) {
        log.error(`Failed to save Swagger spec: ${error.message}`)
        hasErrors = true
    }

    // Final summary
    log.header('\n📊 Summary')
    console.log('')
    console.log(`Total Endpoints:     ${pathCount}`)
    console.log(`Total Schemas:       ${schemaCount}`)
    console.log(`Total Responses:     ${responseCount}`)
    console.log(`Total Parameters:    ${parameterCount}`)
    console.log(`Total Tags:          ${tags.length}`)
    console.log(`Warnings:            ${pathWarnings}`)
    console.log('')

    if (hasErrors) {
        log.header('❌ Validation Failed')
        console.log('')
        process.exit(1)
    }

    log.header('✨ Validation Successful!')
    console.log('')
    log.info('Your Swagger documentation is ready to use.')
    log.info('View it at: http://localhost:5000/api-docs')
    console.log('')
}

// Run validation
try {
    validateSwagger()
} catch (error) {
    console.error('')
    log.error(`Validation error: ${error.message}`)
    console.error(error.stack)
    console.error('')
    process.exit(1)
}

