require('module-alias/register')
require('../aliases')
require('dotenv').config()

const mongoose = require('mongoose')
const app = require('../src/app')

let isConnected = false

// Database connection for serverless
const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing MongoDB connection')
        return
    }

    try {
        const opts = {
            bufferCommands: false,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }

        await mongoose.connect(process.env.MONGODB_URI, opts)
        isConnected = true
        console.log('MongoDB connected successfully')
    } catch (error) {
        console.error('MongoDB connection error:', error)
        throw error
    }
}

// Serverless function handler
module.exports = async (req, res) => {
    try {
        await connectDB()

        // Handle the request using your Express app
        return app(req, res)
    } catch (error) {
        console.error('Serverless function error:', error)
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        })
    }
}