require('module-alias/register')
require('../aliases')

const { connect, createIndexes } = require('../src/config')
const logger = require('../src/common/utils/logger')
const app = require('../src/app')

let isConnected = false
let connectionPromise = null

const connectDB = async () => {
    if (isConnected) {
        logger.debug('Reusing existing database connection')
        return
    }

    if (connectionPromise) {
        logger.debug('Waiting for existing connection attempt')
        return connectionPromise
    }

    logger.info('Establishing new database connection...')
    connectionPromise = (async () => {
        try {
            await connect()
            await createIndexes()
            isConnected = true
            logger.success('✅ Database connected and indexes created')
        } catch (error) {
            logger.error('❌ Database connection failed:', error)
            connectionPromise = null
            throw error
        }
    })()

    return connectionPromise
}

module.exports = async (req, res) => {
    try {
        await connectDB()
        return app(req, res)
    } catch (error) {
        logger.error('❌ Serverless handler error:', error)

        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'production'
                    ? 'Something went wrong'
                    : error.message,
            })
        }
    }
}