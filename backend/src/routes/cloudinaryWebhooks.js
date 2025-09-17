const express = require('express')
const crypto = require('crypto')
const logger = require('@utils/logger')
const { updateCloudinaryUsage, logImageEvent } = require('@services/analyticsService')

const router = express.Router()

// Middleware to verify Cloudinary webhook signature
const verifyCloudinarySignature = (req, res, next) => {
    const signature = req.get('X-Cld-Signature')
    const timestamp = req.get('X-Cld-Timestamp')

    if (!signature || !timestamp) {
        logger.warn('Missing Cloudinary webhook signature or timestamp')
        return res.status(400).json({ error: 'Missing signature or timestamp' })
    }

    // Verify timestamp (should be within 5 minutes)
    const currentTime = Math.floor(Date.now() / 1000)
    if (Math.abs(currentTime - parseInt(timestamp)) > 300) {
        logger.warn('Cloudinary webhook timestamp too old')
        return res.status(400).json({ error: 'Timestamp too old' })
    }

    // Verify signature
    const body = JSON.stringify(req.body)
    const expectedSignature = crypto
        .createHmac('sha1', process.env.CLOUDINARY_API_SECRET)
        .update(body + timestamp)
        .digest('hex')

    if (signature !== expectedSignature) {
        logger.warn('Invalid Cloudinary webhook signature')
        return res.status(401).json({ error: 'Invalid signature' })
    }

    next()
}

// Handle upload completion events
const handleUploadEvent = async (req, res) => {
    try {
        const { notification_type, public_id, version, format, resource_type, bytes, url, secure_url } = req.body

        logger.info(`Cloudinary upload event: ${notification_type} for ${public_id}`)

        const eventData = {
            type: 'upload',
            publicId: public_id,
            version,
            format,
            resourceType: resource_type,
            bytes,
            url,
            secureUrl: secure_url,
            timestamp: new Date(),
            notificationType: notification_type
        }

        // Log the event
        await logImageEvent(eventData)

        // Update usage statistics
        await updateCloudinaryUsage('upload', bytes)

        // Handle specific upload events
        switch (notification_type) {
            case 'upload':
                await handleUploadSuccess(eventData)
                break
            case 'upload_error':
                await handleUploadError(eventData)
                break
            default:
                logger.info(`Unhandled upload event type: ${notification_type}`)
        }

        res.status(200).json({ message: 'Upload event processed' })

    } catch (error) {
        logger.error('Error handling upload event:', error)
        res.status(500).json({ error: 'Failed to process upload event' })
    }
}

// Handle deletion events
const handleDeleteEvent = async (req, res) => {
    try {
        const { notification_type, public_id } = req.body

        logger.info(`Cloudinary delete event: ${notification_type} for ${public_id}`)

        const eventData = {
            type: 'delete',
            publicId: public_id,
            timestamp: new Date(),
            notificationType: notification_type
        }

        // Log the event
        await logImageEvent(eventData)

        // Clean up database references if needed
        await cleanupImageReferences(public_id)

        res.status(200).json({ message: 'Delete event processed' })

    } catch (error) {
        logger.error('Error handling delete event:', error)
        res.status(500).json({ error: 'Failed to process delete event' })
    }
}

// Handle transformation events (for complex transformations)
const handleTransformationEvent = async (req, res) => {
    try {
        const { notification_type, public_id, eager } = req.body

        logger.info(`Cloudinary transformation event: ${notification_type} for ${public_id}`)

        if (notification_type === 'eager_notification' && eager) {
            // Update database with generated transformation URLs
            await updateTransformationUrls(public_id, eager)
        }

        res.status(200).json({ message: 'Transformation event processed' })

    } catch (error) {
        logger.error('Error handling transformation event:', error)
        res.status(500).json({ error: 'Failed to process transformation event' })
    }
}

// Handle successful uploads
const handleUploadSuccess = async (eventData) => {
    try {
        const { publicId, format, bytes, secureUrl } = eventData

        // Update any pending records in database
        // This is useful for async upload scenarios
        await updatePendingUpload(publicId, {
            status: 'completed',
            url: secureUrl,
            format,
            bytes,
            completedAt: new Date()
        })

        // Trigger post-processing if needed
        await triggerPostProcessing(publicId)

        logger.info(`Upload success processed for: ${publicId}`)

    } catch (error) {
        logger.error('Error handling upload success:', error)
        throw error
    }
}

// Handle upload errors
const handleUploadError = async (eventData) => {
    try {
        const { publicId } = eventData

        // Update any pending records in database
        await updatePendingUpload(publicId, {
            status: 'failed',
            error: eventData.error || 'Upload failed',
            failedAt: new Date()
        })

        logger.error(`Upload failed for: ${publicId}`)

    } catch (error) {
        logger.error('Error handling upload error:', error)
        throw error
    }
}

// Clean up database references when image is deleted
const cleanupImageReferences = async (publicId) => {
    try {
        // Import models dynamically to avoid circular dependencies
        const Restaurant = require('@models/restaurant')
        const Menu = require('@models/menu')
        const MenuItem = require('@models/menuItem')
        const Profile = require('@models/profile')

        // Find and update records that reference this image
        const updatePromises = [
            // Restaurant logos and banners
            Restaurant.updateMany(
                { $or: [{ logoPublicId: publicId }, { bannerPublicId: publicId }] },
                {
                    $unset: {
                        logoPublicId: publicId === '$logoPublicId' ? 1 : 0,
                        bannerPublicId: publicId === '$bannerPublicId' ? 1 : 0
                    }
                }
            ),

            // Restaurant gallery images
            Restaurant.updateMany(
                { 'gallery.publicId': publicId },
                { $pull: { gallery: { publicId } } }
            ),

            // Menu images
            Menu.updateMany(
                { imagePublicId: publicId },
                { $unset: { imagePublicId: 1, image: 1 } }
            ),

            // Menu item images
            MenuItem.updateMany(
                { imagePublicId: publicId },
                { $unset: { imagePublicId: 1, image: 1 } }
            ),

            // Profile avatars
            Profile.updateMany(
                { avatarPublicId: publicId },
                { $unset: { avatarPublicId: 1, avatar: 1 } }
            )
        ]

        await Promise.all(updatePromises)

        logger.info(`Cleaned up database references for deleted image: ${publicId}`)

    } catch (error) {
        logger.error('Error cleaning up image references:', error)
        throw error
    }
}

// Update pending upload records
const updatePendingUpload = async (publicId, updateData) => {
    try {
        // This would be used if you track upload status in a separate collection
        // const UploadStatus = require('@models/uploadStatus');
        // await UploadStatus.updateOne({ publicId }, updateData, { upsert: true });

        logger.debug(`Upload status updated for: ${publicId}`, updateData)

    } catch (error) {
        logger.error('Error updating pending upload:', error)
        throw error
    }
}

// Update transformation URLs in database
const updateTransformationUrls = async (publicId, transformations) => {
    try {
        // Store transformation URLs for quick access
        const transformationData = transformations.map(t => ({
            transformation: t.transformation,
            url: t.secure_url,
            bytes: t.bytes,
            format: t.format
        }))

        // You might want to store these in a separate collection or cache
        logger.info(`Transformations ready for: ${publicId}`, transformationData)

    } catch (error) {
        logger.error('Error updating transformation URLs:', error)
        throw error
    }
}

// Trigger post-processing after successful upload
const triggerPostProcessing = async (publicId) => {
    try {
        // Example post-processing tasks:
        // 1. Generate additional sizes
        // 2. Extract metadata
        // 3. Run image analysis
        // 4. Update search index

        logger.info(`Post-processing triggered for: ${publicId}`)

        // Add your post-processing logic here

    } catch (error) {
        logger.error('Error in post-processing:', error)
        // Don't throw here as it shouldn't fail the webhook
    }
}

// Webhook endpoints
router.post('/upload', verifyCloudinarySignature, handleUploadEvent)
router.post('/delete', verifyCloudinarySignature, handleDeleteEvent)
router.post('/transformation', verifyCloudinarySignature, handleTransformationEvent)

// Health check endpoint for webhooks
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'cloudinary-webhooks',
        timestamp: new Date().toISOString()
    })
})

// Test webhook endpoint (development only)
if (process.env.NODE_ENV !== 'production') {
    router.post('/test', (req, res) => {
        logger.info('Test webhook received:', req.body)
        res.json({ message: 'Test webhook received', body: req.body })
    })
}

module.exports = router