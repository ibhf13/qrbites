const mongoose = require('mongoose')
const Menu = require('@models/menu')
const MenuItem = require('@models/menuItem')
const Restaurant = require('@models/restaurant')
const { connectDB, clearDB, closeDB } = require('@tests/testUtils/dbHandler')
const {
    processMenuForPublic,
    getCompleteMenuData,
    getMenuStatistics,
    validateMenuCompleteness
} = require('@services/menuDataService')

// Mock data
const mockRestaurant = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Test Restaurant',
    description: 'A test restaurant',
    logoUrl: 'http://example.com/logo.jpg',
    userId: new mongoose.Types.ObjectId(),
    contact: {
        phone: '+1234567890',
        email: 'test@restaurant.com'
    },
    location: {
        street: '123 Test Street',
        houseNumber: '123',
        city: 'Test City',
        zipCode: '12345',
    }
}

const mockMenu = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Test Menu',
    description: 'A test menu',
    imageUrl: 'http://example.com/menu.jpg',
    qrCodeUrl: 'http://example.com/qr.png',
    categories: ['Appetizers', 'Main Course'],
    isActive: true,
    restaurantId: mockRestaurant._id
}

const mockMenuItems = [
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Caesar Salad',
        description: 'Fresh lettuce with Caesar dressing',
        price: 12.99,
        category: 'Appetizers',
        imageUrl: 'http://example.com/salad.jpg',
        menuId: mockMenu._id
    },
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Grilled Chicken',
        description: 'Juicy grilled chicken breast',
        price: 18.99,
        category: 'Main Course',
        imageUrl: 'http://example.com/chicken.jpg',
        menuId: mockMenu._id
    },
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Pasta Primavera',
        description: 'Fresh vegetables with pasta',
        price: 15.99,
        category: 'Main Course',
        menuId: mockMenu._id
    }
]

describe('Menu Data Service', () => {
    beforeAll(async () => {
        await connectDB()
    })

    afterAll(async () => {
        await closeDB()
    })

    beforeEach(async () => {
        await clearDB()
    })

    describe('processMenuForPublic', () => {
        it('should process menu data correctly', () => {
            const processedMenu = processMenuForPublic(mockMenu)

            expect(processedMenu).toEqual({
                id: mockMenu._id,
                name: mockMenu.name,
                description: mockMenu.description,
                imageUrl: mockMenu.imageUrl,
                qrCodeUrl: mockMenu.qrCodeUrl,
                restaurant: {
                    id: mockMenu.restaurantId,
                    name: null
                },
                categories: mockMenu.categories,
                isActive: mockMenu.isActive,
                updatedAt: mockMenu.updatedAt
            })
        })

        it('should handle menu with populated restaurant', () => {
            const menuWithRestaurant = {
                ...mockMenu,
                restaurantId: mockRestaurant
            }

            const processedMenu = processMenuForPublic(menuWithRestaurant)

            expect(processedMenu.restaurant).toEqual({
                id: mockRestaurant._id,
                name: mockRestaurant.name
            })
        })

        it('should return null for null menu', () => {
            const result = processMenuForPublic(null)
            expect(result).toBeNull()
        })
    })

    describe('getCompleteMenuData', () => {
        let createdRestaurant, createdMenu, createdMenuItems

        beforeEach(async () => {
            createdRestaurant = await Restaurant.create(mockRestaurant)
            createdMenu = await Menu.create({
                ...mockMenu,
                restaurantId: createdRestaurant._id
            })
            createdMenuItems = await MenuItem.create(
                mockMenuItems.map(item => ({
                    ...item,
                    menuId: createdMenu._id
                }))
            )
        })

        it('should return complete menu data with categorized items', async () => {
            const result = await getCompleteMenuData(createdMenu._id)

            expect(result).toHaveProperty('menu')
            expect(result).toHaveProperty('categories')
            expect(result).toHaveProperty('itemsByCategory')
            expect(result).toHaveProperty('totalItems')

            expect(result.menu.name).toBe(mockMenu.name)
            expect(result.categories).toEqual(['Appetizers', 'Main Course'])
            expect(result.totalItems).toBe(3)
            expect(result.itemsByCategory['Appetizers']).toHaveLength(1)
            expect(result.itemsByCategory['Main Course']).toHaveLength(2)
        })

        it('should throw error for non-existent menu', async () => {
            const nonExistentId = new mongoose.Types.ObjectId()
            await expect(getCompleteMenuData(nonExistentId)).rejects.toThrow('Menu not found')
        })
    })

    describe('getMenuStatistics', () => {
        let createdMenu, createdMenuItems

        beforeEach(async () => {
            createdMenu = await Menu.create(mockMenu)
            createdMenuItems = await MenuItem.create(
                mockMenuItems.map(item => ({
                    ...item,
                    menuId: createdMenu._id
                }))
            )
        })

        it('should calculate menu statistics correctly', async () => {
            const stats = await getMenuStatistics(createdMenu._id)

            expect(stats.totalItems).toBe(3)
            expect(stats.categoriesCount).toBe(2)
            expect(stats.priceRange.min).toBe(12.99)
            expect(stats.priceRange.max).toBe(18.99)
            expect(stats.priceRange.average).toBeCloseTo(15.99, 2)
            expect(stats.itemsWithImages).toBe(2)
            expect(stats.categoriesDistribution).toEqual({
                'Appetizers': 1,
                'Main Course': 2
            })
        })

        it('should handle menu with no items', async () => {
            const emptyMenu = await Menu.create({
                ...mockMenu,
                _id: new mongoose.Types.ObjectId()
            })

            const stats = await getMenuStatistics(emptyMenu._id)

            expect(stats.totalItems).toBe(0)
            expect(stats.categoriesCount).toBe(0)
            expect(stats.itemsWithImages).toBe(0)
        })
    })

    describe('validateMenuCompleteness', () => {
        it('should validate complete menu', async () => {
            const restaurant = await Restaurant.create(mockRestaurant)
            const menu = await Menu.create({
                ...mockMenu,
                restaurantId: restaurant._id
            })
            await MenuItem.create(
                mockMenuItems.map(item => ({
                    ...item,
                    menuId: menu._id
                }))
            )

            const validation = await validateMenuCompleteness(menu._id)

            expect(validation.isComplete).toBe(true)
            expect(validation.issues).toHaveLength(0)
        })

        it('should identify incomplete menu', async () => {
            const incompleteMenu = await Menu.create({
                ...mockMenu,
                description: null,
                qrCodeUrl: null
            })

            const validation = await validateMenuCompleteness(incompleteMenu._id)

            expect(validation.isComplete).toBe(false)
            expect(validation.issues).toContain('Menu missing description')
            expect(validation.issues).toContain('Menu missing QR code')
            expect(validation.issues).toContain('Menu has no items')
        })

        it('should provide suggestions for improvements', async () => {
            const menu = await Menu.create({
                ...mockMenu,
                imageUrl: null
            })

            await MenuItem.create([
                {
                    ...mockMenuItems[0],
                    menuId: menu._id,
                    description: null
                }
            ])

            const validation = await validateMenuCompleteness(menu._id)

            expect(validation.suggestions).toContain('Consider adding a menu image')
            expect(validation.suggestions).toContain('1 items could use descriptions')
        })

        it('should identify items missing prices', async () => {
            const menu = await Menu.create(mockMenu)
            // Create items with invalid prices that bypass mongoose validation
            const menuItemData = [
                {
                    name: 'Test Item 1',
                    description: 'Test description',
                    price: 0,
                    category: 'Test',
                    menuId: menu._id
                }
            ]

            // Insert directly to bypass validation
            await MenuItem.collection.insertMany(menuItemData)

            const validation = await validateMenuCompleteness(menu._id)

            expect(validation.issues).toContain('1 items missing prices')
        })
    })
}) 