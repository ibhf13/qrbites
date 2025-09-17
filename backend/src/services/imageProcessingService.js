const { cloudinary, generateUrl, uploadBuffer } = require('./cloudinaryService')
const logger = require('@utils/logger')

/**
 * Image processing and manipulation service
 */
class ImageProcessingService {

    /**
     * Generate multiple optimized versions of an image
     * @param {string} publicId - Cloudinary public ID
     * @param {Object} options - Processing options
     * @returns {Object} Various image versions
     */
    static generateImageVariations(publicId, options = {}) {
        const {
            entityType = 'general',
            includeWebP = true,
            includeAVIF = false,
            customSizes = []
        } = options

        const baseVariations = {
            thumbnail: { width: 150, height: 150, crop: 'fill' },
            small: { width: 300, height: 200, crop: 'fill' },
            medium: { width: 600, height: 400, crop: 'fill' },
            large: { width: 1200, height: 800, crop: 'fill' },
            original: {}
        }

        // Entity-specific variations
        const entityVariations = {
            restaurant: {
                logo: { width: 200, height: 200, crop: 'fill', gravity: 'center' },
                banner: { width: 1200, height: 300, crop: 'fill' },
                card: { width: 400, height: 250, crop: 'fill' }
            },
            menuItem: {
                thumbnail: { width: 100, height: 100, crop: 'fill' },
                card: { width: 300, height: 200, crop: 'fill' },
                detail: { width: 600, height: 400, crop: 'fill' },
                hero: { width: 800, height: 500, crop: 'fill' }
            },
            profile: {
                avatar: { width: 200, height: 200, crop: 'fill', gravity: 'face' },
                thumbnail: { width: 64, height: 64, crop: 'fill', gravity: 'face' }
            },
            qrcode: {
                small: { width: 256, height: 256, crop: 'fit' },
                medium: { width: 512, height: 512, crop: 'fit' },
                large: { width: 1024, height: 1024, crop: 'fit' },
                print: { width: 2048, height: 2048, crop: 'fit', quality: 'auto:best' }
            }
        }

        const variations = {
            ...baseVariations,
            ...(entityVariations[entityType] || {}),
            ...Object.fromEntries(customSizes.map((size, index) => [`custom_${index}`, size]))
        }

        const result = {}

        // Generate URLs for each variation
        Object.entries(variations).forEach(([key, transformation]) => {
            const baseTransformation = {
                ...transformation,
                quality: 'auto:good',
                fetch_format: 'auto'
            }

            result[key] = {
                url: generateUrl(publicId, baseTransformation),
                webp: includeWebP ? generateUrl(publicId, { ...baseTransformation, fetch_format: 'webp' }) : null,
                avif: includeAVIF ? generateUrl(publicId, { ...baseTransformation, fetch_format: 'avif' }) : null
            }

            // Remove null values
            result[key] = Object.fromEntries(
                Object.entries(result[key]).filter(([_, value]) => value !== null)
            )
        })

        return result
    }

    /**
     * Apply artistic effects to images
     * @param {string} publicId - Cloudinary public ID
     * @param {string} effect - Effect name
     * @param {Object} options - Effect options
     * @returns {string} Transformed image URL
     */
    static applyArtisticEffect(publicId, effect, options = {}) {
        const effects = {
            sepia: { effect: 'sepia' },
            grayscale: { effect: 'grayscale' },
            blur: { effect: 'blur:300' },
            sharpen: { effect: 'sharpen' },
            vintage: { effect: 'sepia:50', saturation: -30, brightness: -10 },
            dramatic: { effect: 'contrast:20', saturation: 20, brightness: -5 },
            soft: { effect: 'blur:100', opacity: 80 },
            vibrant: { saturation: 30, vibrance: 20 },
            matte: { contrast: -10, brightness: 5, saturation: -10 },
            fade: { opacity: 70, brightness: 10 }
        }

        const transformation = effects[effect] || {}

        return generateUrl(publicId, {
            ...transformation,
            ...options,
            quality: 'auto:good',
            fetch_format: 'auto'
        })
    }

    /**
     * Create branded overlays for images
     * @param {string} publicId - Base image public ID
     * @param {Object} branding - Branding options
     * @returns {string} Image URL with overlay
     */
    static addBrandingOverlay(publicId, branding = {}) {
        const {
            logoPublicId = null,
            watermarkText = null,
            position = 'bottom_right',
            opacity = 60,
            size = 'small'
        } = branding

        const positions = {
            top_left: 'north_west',
            top_right: 'north_east',
            bottom_left: 'south_west',
            bottom_right: 'south_east',
            center: 'center'
        }

        const sizes = {
            small: { width: 100 },
            medium: { width: 150 },
            large: { width: 200 }
        }

        let transformation = {
            quality: 'auto:good',
            fetch_format: 'auto'
        }

        if (logoPublicId) {
            // Logo overlay
            transformation = {
                ...transformation,
                overlay: logoPublicId,
                gravity: positions[position] || 'south_east',
                opacity,
                ...sizes[size],
                x: 20,
                y: 20
            }
        } else if (watermarkText) {
            // Text watermark
            transformation = {
                ...transformation,
                overlay: {
                    text: watermarkText,
                    font_family: 'Arial',
                    font_size: 24,
                    font_weight: 'bold'
                },
                gravity: positions[position] || 'south_east',
                opacity,
                color: 'white',
                x: 20,
                y: 20
            }
        }

        return generateUrl(publicId, transformation)
    }

    /**
     * Generate social media optimized versions
     * @param {string} publicId - Cloudinary public ID
     * @param {Array} platforms - Social platforms to optimize for
     * @returns {Object} Platform-optimized URLs
     */
    static generateSocialMediaVersions(publicId, platforms = ['facebook', 'instagram', 'twitter']) {
        const socialSpecs = {
            facebook: {
                post: { width: 1200, height: 630, crop: 'fill' },
                story: { width: 1080, height: 1920, crop: 'fill' },
                cover: { width: 1640, height: 859, crop: 'fill' }
            },
            instagram: {
                post: { width: 1080, height: 1080, crop: 'fill' },
                story: { width: 1080, height: 1920, crop: 'fill' },
                reel: { width: 1080, height: 1920, crop: 'fill' }
            },
            twitter: {
                post: { width: 1200, height: 675, crop: 'fill' },
                header: { width: 1500, height: 500, crop: 'fill' }
            },
            linkedin: {
                post: { width: 1200, height: 627, crop: 'fill' },
                banner: { width: 1584, height: 396, crop: 'fill' }
            },
            pinterest: {
                pin: { width: 735, height: 1102, crop: 'fill' }
            }
        }

        const result = {}

        platforms.forEach(platform => {
            if (socialSpecs[platform]) {
                result[platform] = {}

                Object.entries(socialSpecs[platform]).forEach(([type, specs]) => {
                    result[platform][type] = generateUrl(publicId, {
                        ...specs,
                        quality: 'auto:good',
                        fetch_format: 'auto',
                        gravity: 'center'
                    })
                })
            }
        })

        return result
    }

    /**
     * Generate progressive web app (PWA) icons
     * @param {string} publicId - Logo public ID
     * @returns {Object} PWA icon URLs and manifest
     */
    static generatePWAIcons(publicId) {
        const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512]

        const icons = iconSizes.map(size => ({
            src: generateUrl(publicId, {
                width: size,
                height: size,
                crop: 'fit',
                background: 'white',
                quality: 'auto:best',
                fetch_format: 'png'
            }),
            sizes: `${size}x${size}`,
            type: 'image/png'
        }))

        return {
            icons,
            manifest: {
                icons: icons.map(icon => ({
                    src: icon.src,
                    sizes: icon.sizes,
                    type: icon.type,
                    purpose: 'any maskable'
                }))
            }
        }
    }

    /**
     * Create animated GIF from multiple images
     * @param {Array} publicIds - Array of image public IDs
     * @param {Object} options - Animation options
     * @returns {Promise<Object>} Animated GIF result
     */
    static async createAnimatedGIF(publicIds, options = {}) {
        try {
            const {
                width = 400,
                height = 400,
                delay = 1000,
                loop = 0,
                format = 'gif'
            } = options

            // Create video from images (Cloudinary feature)
            const result = await cloudinary.uploader.create_slideshow({
                manifest_transformation: {
                    width,
                    height,
                    crop: 'fill',
                    quality: 'auto:good'
                },
                notification_url: process.env.CLOUDINARY_WEBHOOK_URL,
                manifest_json: {
                    w: width,
                    h: height,
                    fps: 1000 / delay,
                    loop,
                    slides: publicIds.map(id => ({ media: `i:${id}`, duration: delay / 1000 }))
                }
            })

            return {
                publicId: result.public_id,
                url: result.secure_url,
                format: result.format,
                width: result.width,
                height: result.height
            }

        } catch (error) {
            logger.error('Error creating animated GIF:', error)
            throw error
        }
    }

    /**
     * Extract dominant colors from image
     * @param {string} publicId - Cloudinary public ID
     * @returns {Promise<Array>} Dominant colors array
     */
    static async extractColors(publicId) {
        try {
            const result = await cloudinary.api.resource(publicId, {
                colors: true,
                image_metadata: true
            })

            return {
                colors: result.colors || [],
                predominant: result.predominant?.google || [],
                metadata: {
                    width: result.width,
                    height: result.height,
                    format: result.format,
                    colorSpace: result.image_metadata?.ColorSpace
                }
            }

        } catch (error) {
            logger.error('Error extracting colors:', error)
            throw error
        }
    }

    /**
     * Auto-crop image to remove whitespace
     * @param {string} publicId - Cloudinary public ID
     * @param {Object} options - Cropping options
     * @returns {string} Auto-cropped image URL
     */
    static autoCrop(publicId, options = {}) {
        const {
            gravity = 'auto',
            width,
            height,
            threshold = 10
        } = options

        return generateUrl(publicId, {
            width,
            height,
            crop: 'auto',
            gravity,
            quality: 'auto:good',
            fetch_format: 'auto',
            // Remove background/whitespace
            background: 'auto',
            color: `#${threshold.toString(16).padStart(2, '0').repeat(3)}`
        })
    }

    /**
     * Create image collage
     * @param {Array} images - Array of {publicId, x, y, width, height}
     * @param {Object} canvasOptions - Canvas options
     * @returns {Promise<Object>} Collage result
     */
    static async createCollage(images, canvasOptions = {}) {
        try {
            const {
                width = 800,
                height = 600,
                background = 'white',
                quality = 'auto:good'
            } = canvasOptions

            // Create base canvas
            const baseTransformation = {
                width,
                height,
                crop: 'fit',
                background,
                quality,
                fetch_format: 'auto'
            }

            // Build overlay transformations
            const overlays = images.map(img => ({
                overlay: img.publicId,
                width: img.width,
                height: img.height,
                x: img.x,
                y: img.y,
                crop: 'fill'
            }))

            // Use the first image as base and apply overlays
            const firstImage = images[0]
            const remainingOverlays = overlays.slice(1)

            let transformation = {
                ...baseTransformation,
                overlay: firstImage.publicId,
                ...overlays[0]
            }

            // Chain additional overlays
            remainingOverlays.forEach((overlay, index) => {
                transformation[`overlay_${index + 1}`] = overlay.overlay
                transformation[`width_${index + 1}`] = overlay.width
                transformation[`height_${index + 1}`] = overlay.height
                transformation[`x_${index + 1}`] = overlay.x
                transformation[`y_${index + 1}`] = overlay.y
                transformation[`crop_${index + 1}`] = overlay.crop
            })

            // For complex collages, use Cloudinary's upload with transformation
            const result = await cloudinary.uploader.upload(
                generateUrl(firstImage.publicId, transformation),
                {
                    folder: 'qrbites/collages',
                    public_id: `collage_${Date.now()}`,
                    tags: ['collage', 'generated']
                }
            )

            return {
                publicId: result.public_id,
                url: result.secure_url,
                width: result.width,
                height: result.height,
                format: result.format
            }

        } catch (error) {
            logger.error('Error creating collage:', error)
            throw error
        }
    }

    /**
     * Batch process multiple images
     * @param {Array} publicIds - Array of public IDs
     * @param {Function} processFunction - Processing function to apply
     * @param {Object} options - Processing options
     * @returns {Promise<Array>} Results array
     */
    static async batchProcess(publicIds, processFunction, options = {}) {
        const {
            concurrency = 5,
            retries = 3,
            onProgress = null
        } = options

        const results = []
        const chunks = []

        // Split into chunks for concurrent processing
        for (let i = 0; i < publicIds.length; i += concurrency) {
            chunks.push(publicIds.slice(i, i + concurrency))
        }

        let processed = 0

        for (const chunk of chunks) {
            const chunkPromises = chunk.map(async (publicId) => {
                let attempts = 0

                while (attempts < retries) {
                    try {
                        const result = await processFunction(publicId)
                        processed++

                        if (onProgress) {
                            onProgress(processed, publicIds.length)
                        }

                        return { publicId, success: true, result }

                    } catch (error) {
                        attempts++

                        if (attempts >= retries) {
                            return { publicId, success: false, error: error.message }
                        }

                        // Wait before retry
                        await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
                    }
                }
            })

            const chunkResults = await Promise.allSettled(chunkPromises)
            results.push(...chunkResults.map(r => r.value))
        }

        return results
    }

    /**
     * Get advanced image analytics
     * @param {string} publicId - Cloudinary public ID
     * @returns {Promise<Object>} Advanced analytics
     */
    static async getAdvancedAnalytics(publicId) {
        try {
            const [resource, analysis] = await Promise.all([
                cloudinary.api.resource(publicId, {
                    image_metadata: true,
                    colors: true,
                    accessibility_analysis: true,
                    quality_analysis: true
                }),
                // Add additional analysis APIs here
                Promise.resolve({}) // Placeholder for custom analysis
            ])

            return {
                basic: {
                    publicId: resource.public_id,
                    url: resource.secure_url,
                    width: resource.width,
                    height: resource.height,
                    format: resource.format,
                    bytes: resource.bytes,
                    createdAt: resource.created_at
                },
                colors: {
                    dominant: resource.colors || [],
                    predominant: resource.predominant || {}
                },
                metadata: resource.image_metadata || {},
                accessibility: resource.accessibility_analysis || {},
                quality: resource.quality_analysis || {},
                custom: analysis
            }

        } catch (error) {
            logger.error('Error getting advanced analytics:', error)
            throw error
        }
    }
}

module.exports = ImageProcessingService