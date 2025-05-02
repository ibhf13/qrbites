const axios = require('axios')
const menuClientService = require('@services/menuClientService')
const menuMock = require('@mocks/menuMockEnhanced')

// Mock axios
jest.mock('axios')

describe('Menu Client Service', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getMenus', () => {
        it('should fetch menus with no filters', async () => {
            // Mock axios response
            axios.get.mockResolvedValue({
                data: {
                    success: true,
                    data: menuMock.menuList,
                    pagination: {
                        page: 1,
                        limit: 10,
                        total: 2,
                        pages: 1
                    }
                }
            })

            const result = await menuClientService.getMenus()

            // Verify axios was called with the correct URL
            expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/api/menus?')

            // Verify the returned data
            expect(result.success).toBe(true)
            expect(result.data).toEqual(menuMock.menuList)
            expect(result.pagination).toBeDefined()
        })

        it('should fetch menus with filters', async () => {
            // Mock axios response
            axios.get.mockResolvedValue({
                data: {
                    success: true,
                    data: [menuMock.menuList[0]],
                    pagination: {
                        page: 1,
                        limit: 10,
                        total: 1,
                        pages: 1
                    }
                }
            })

            const filters = {
                name: 'Lunch',
                restaurantId: '507f1f77bcf86cd799439011',
                page: 1,
                limit: 10
            }

            const result = await menuClientService.getMenus(filters)

            // Verify axios was called with the correct URL
            expect(axios.get).toHaveBeenCalledWith(
                'http://localhost:3000/api/menus?name=Lunch&restaurantId=507f1f77bcf86cd799439011&page=1&limit=10'
            )

            // Verify the returned data
            expect(result.success).toBe(true)
            expect(result.data).toHaveLength(1)
        })

        it('should handle errors correctly', async () => {
            // Mock axios error
            axios.get.mockRejectedValue(new Error('Network error'))

            // Expect the service to throw the error
            await expect(menuClientService.getMenus()).rejects.toThrow('Network error')
        })
    })

    describe('getMenuById', () => {
        it('should fetch a menu by ID', async () => {
            // Mock axios response
            axios.get.mockResolvedValue({
                data: {
                    success: true,
                    data: menuMock.menuList[0]
                }
            })

            const menuId = menuMock.menuList[0]._id
            const result = await menuClientService.getMenuById(menuId)

            // Verify axios was called with the correct URL
            expect(axios.get).toHaveBeenCalledWith(`http://localhost:3000/api/menus/${menuId}`)

            // Verify the returned data
            expect(result.success).toBe(true)
            expect(result.data).toEqual(menuMock.menuList[0])
        })

        it('should handle errors correctly', async () => {
            // Mock axios error
            axios.get.mockRejectedValue(new Error('Menu not found'))

            // Expect the service to throw the error
            await expect(menuClientService.getMenuById('invalid-id')).rejects.toThrow('Menu not found')
        })
    })

    describe('createMenu', () => {
        it('should create a menu without image', async () => {
            // Mock axios response
            axios.post.mockResolvedValue({
                data: {
                    success: true,
                    data: {
                        ...menuMock.validMenu,
                        _id: '60d21b4667d0d8992e610c99'
                    }
                }
            })

            const result = await menuClientService.createMenu(menuMock.validMenu)

            // Verify axios was called with the correct URL and data
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:3000/api/menus',
                menuMock.validMenu
            )

            // Verify the returned data
            expect(result.success).toBe(true)
            expect(result.data.name).toBe(menuMock.validMenu.name)
        })

        it('should create a menu with image', async () => {
            // Create a more realistic mock of FormData
            const mockFormData = {
                append: jest.fn()
            }

            global.FormData = jest.fn(() => mockFormData)

            axios.post.mockResolvedValue({
                data: {
                    success: true,
                    data: {
                        ...menuMock.validMenu,
                        _id: '60d21b4667d0d8992e610c99',
                        imageUrl: 'http://localhost:3000/uploads/menus/test-image.jpg'
                    }
                }
            })

            const testImage = new Blob(['test image content'], { type: 'image/jpeg' })
            const result = await menuClientService.createMenu(menuMock.validMenu, testImage)

            // Verify form data was populated
            expect(mockFormData.append).toHaveBeenCalledWith('image', testImage)

            // Verify menuData was appended to form
            Object.entries(menuMock.validMenu).forEach(([key, value]) => {
                // String conversion happens inside the service
                const expectedValue = typeof value === 'boolean' || typeof value === 'number'
                    ? String(value)
                    : typeof value === 'object' ? JSON.stringify(value) : value

                expect(mockFormData.append).toHaveBeenCalledWith(key, expect.anything())
            })

            // Verify axios was called with the mock form data
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:3000/api/menus',
                mockFormData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )

            // Verify the returned data
            expect(result.success).toBe(true)
            expect(result.data.imageUrl).toBeDefined()
        })
    })

    describe('updateMenu', () => {
        it('should update a menu without image', async () => {
            // Mock axios response
            axios.put.mockResolvedValue({
                data: {
                    success: true,
                    data: {
                        ...menuMock.validMenu,
                        _id: '60d21b4667d0d8992e610c99',
                        name: 'Updated Menu Name'
                    }
                }
            })

            const menuId = '60d21b4667d0d8992e610c99'
            const updateData = { name: 'Updated Menu Name' }
            const result = await menuClientService.updateMenu(menuId, updateData)

            // Verify axios was called with the correct URL and data
            expect(axios.put).toHaveBeenCalledWith(
                `http://localhost:3000/api/menus/${menuId}`,
                updateData
            )

            // Verify the returned data
            expect(result.success).toBe(true)
            expect(result.data.name).toBe('Updated Menu Name')
        })

        it('should update a menu with image', async () => {
            // Create a mock FormData
            const mockFormData = {
                append: jest.fn()
            }
            global.FormData = jest.fn(() => mockFormData)

            axios.put.mockResolvedValue({
                data: {
                    success: true,
                    data: {
                        ...menuMock.validMenu,
                        _id: '60d21b4667d0d8992e610c99',
                        name: 'Updated Menu Name',
                        imageUrl: 'http://localhost:3000/uploads/menus/updated-image.jpg'
                    }
                }
            })

            const menuId = '60d21b4667d0d8992e610c99'
            const updateData = { name: 'Updated Menu Name' }
            const testImage = new Blob(['updated image content'], { type: 'image/jpeg' })
            const result = await menuClientService.updateMenu(menuId, updateData, testImage)

            // Verify form data was populated
            expect(mockFormData.append).toHaveBeenCalledWith('image', testImage)
            expect(mockFormData.append).toHaveBeenCalledWith('name', 'Updated Menu Name')

            // Verify axios was called with the mock form data
            expect(axios.put).toHaveBeenCalledWith(
                `http://localhost:3000/api/menus/${menuId}`,
                mockFormData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )

            // Verify the returned data
            expect(result.success).toBe(true)
            expect(result.data.imageUrl).toBeDefined()
        })

        it('should handle errors when updating a menu', async () => {
            // Mock axios error
            axios.put.mockRejectedValue(new Error('Failed to update menu'))

            // Expect the service to throw the error
            const menuId = '60d21b4667d0d8992e610c99'
            const updateData = { name: 'Updated Menu Name' }
            await expect(menuClientService.updateMenu(menuId, updateData)).rejects.toThrow('Failed to update menu')
        })
    })

    describe('deleteMenu', () => {
        it('should delete a menu', async () => {
            // Mock axios response
            axios.delete.mockResolvedValue({ status: 204 })

            const menuId = '60d21b4667d0d8992e610c99'
            await menuClientService.deleteMenu(menuId)

            // Verify axios was called with the correct URL
            expect(axios.delete).toHaveBeenCalledWith(`http://localhost:3000/api/menus/${menuId}`)
        })

        it('should handle errors when deleting a menu', async () => {
            // Mock axios error
            axios.delete.mockRejectedValue(new Error('Failed to delete menu'))

            // Expect the service to throw the error
            const menuId = '60d21b4667d0d8992e610c99'
            await expect(menuClientService.deleteMenu(menuId)).rejects.toThrow('Failed to delete menu')
        })
    })

    describe('uploadImage', () => {
        it('should upload an image for a menu', async () => {
            // Create a mock FormData
            const mockFormData = {
                append: jest.fn()
            }
            global.FormData = jest.fn(() => mockFormData)

            axios.post.mockResolvedValue({
                data: {
                    success: true,
                    data: {
                        imageUrl: 'http://localhost:3000/uploads/menus/new-image.jpg'
                    }
                }
            })

            const menuId = '60d21b4667d0d8992e610c99'
            const testImage = new Blob(['image content'], { type: 'image/jpeg' })
            const result = await menuClientService.uploadImage(menuId, testImage)

            // Verify form data was populated
            expect(mockFormData.append).toHaveBeenCalledWith('image', testImage)

            // Verify axios was called with the mock form data
            expect(axios.post).toHaveBeenCalledWith(
                `http://localhost:3000/api/menus/${menuId}/image`,
                mockFormData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )

            // Verify the returned data
            expect(result.success).toBe(true)
            expect(result.data.imageUrl).toBeDefined()
        })

        it('should handle errors when uploading an image', async () => {
            // Directly mock axios.post to throw an error
            axios.post.mockRejectedValue(new Error('Failed to upload image'))

            // Ensure FormData is available for the test
            const mockFormData = {
                append: jest.fn()
            }
            global.FormData = jest.fn(() => mockFormData)

            // Expect the service to throw the error
            const menuId = '60d21b4667d0d8992e610c99'
            const testImage = new Blob(['image content'], { type: 'image/jpeg' })
            await expect(menuClientService.uploadImage(menuId, testImage)).rejects.toThrow('Failed to upload image')
        })
    })

    describe('getMenuItems', () => {
        it('should fetch menu items for a specific menu', async () => {
            // Mock axios response
            axios.get.mockResolvedValue({
                data: {
                    success: true,
                    data: [
                        { name: 'Item 1', price: 10.99, menuId: '60d21b4667d0d8992e610c99' },
                        { name: 'Item 2', price: 12.99, menuId: '60d21b4667d0d8992e610c99' }
                    ],
                    pagination: {
                        page: 1,
                        limit: 10,
                        total: 2,
                        pages: 1
                    }
                }
            })

            const menuId = '60d21b4667d0d8992e610c99'
            const result = await menuClientService.getMenuItems(menuId)

            // Verify axios was called with the correct URL
            expect(axios.get).toHaveBeenCalledWith(`http://localhost:3000/api/menu-items?menuId=${menuId}`)

            // Verify the returned data
            expect(result.success).toBe(true)
            expect(result.data).toHaveLength(2)
            expect(result.data[0].name).toBe('Item 1')
            expect(result.data[1].name).toBe('Item 2')
        })

        it('should handle errors when fetching menu items', async () => {
            // Mock axios error
            axios.get.mockRejectedValue(new Error('Failed to fetch menu items'))

            // Expect the service to throw the error
            const menuId = '60d21b4667d0d8992e610c99'
            await expect(menuClientService.getMenuItems(menuId)).rejects.toThrow('Failed to fetch menu items')
        })
    })

    describe('generateQRCode', () => {
        it('should generate a QR code for a menu', async () => {
            // Mock axios response
            axios.post.mockResolvedValue({
                data: {
                    success: true,
                    data: {
                        qrCodeUrl: 'http://localhost:3000/uploads/qrcodes/menu-qr.png'
                    }
                }
            })

            const menuId = '60d21b4667d0d8992e610c85'
            const result = await menuClientService.generateQRCode(menuId)

            // Verify axios was called with the correct URL
            expect(axios.post).toHaveBeenCalledWith(`http://localhost:3000/api/menus/${menuId}/qrcode`)

            // Verify the returned data
            expect(result.success).toBe(true)
            expect(result.data.qrCodeUrl).toBe('http://localhost:3000/uploads/qrcodes/menu-qr.png')
        })

        it('should handle errors correctly', async () => {
            // Mock axios error
            axios.post.mockRejectedValue(new Error('Failed to generate QR code'))

            // Expect the service to throw the error
            await expect(menuClientService.generateQRCode('invalid-id')).rejects.toThrow('Failed to generate QR code')
        })
    })
}) 