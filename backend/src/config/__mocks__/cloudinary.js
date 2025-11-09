/**
 * Mock for Cloudinary configuration module
 * This mock is automatically used by Jest when the module is imported
 */

const uploadToCloudinary = (buffer, folder, publicId) => {
  return Promise.resolve({
    secure_url: 'https://test.cloudinary.com/qr-code.png',
    public_id: `qrcodes/${publicId || 'test-qr-code'}`,
    url: 'https://test.cloudinary.com/qr-code.png',
  })
}

const cloudinary = {
  v2: {
    config: () => {},
    uploader: {
      upload: () =>
        Promise.resolve({
          secure_url: 'https://test.cloudinary.com/test-image.jpg',
          public_id: 'test-public-id',
        }),
      upload_stream: (options, callback) => {
        const stream = {
          end: () => {
            if (callback) {
              callback(null, {
                secure_url: 'https://test.cloudinary.com/qr-code.png',
                public_id: 'qrcodes/test-qr-code',
                url: 'https://test.cloudinary.com/qr-code.png',
              })
            }
          },
        }
        return stream
      },
      destroy: () => Promise.resolve({ result: 'ok' }),
    },
  },
}

const deleteFromCloudinary = () => Promise.resolve({ result: 'ok' })

const getPublicIdFromUrl = url => {
  if (!url) return null
  const match = url.match(/\/qrbites\/([^/]+)\/([^.]+)/)
  if (match) {
    return `qrbites/${match[1]}/${match[2]}`
  }
  return null
}

const isCloudinaryConfigured = () => true

module.exports = {
  uploadToCloudinary,
  cloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl,
  isCloudinaryConfigured,
}
