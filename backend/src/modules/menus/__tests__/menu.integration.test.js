// Use manual mock for Cloudinary (must be before imports)
jest.mock('@config/cloudinary')

const request = require('supertest')
const app = require('@app')
const Menu = require('@modules/menus/models/menu')
const MenuItem = require('@modules/menuItems/models/menuItem')
const {
    createTestUser,
    createTestAdmin,
    createTestRestaurant,
    createTestMenu,
    createTestMenuItem,
    assertSuccessResponse,
    assertPaginationResponse,
} = require('../../../../__tests__/helpers/testHelpers')

describe('Menu Integration Tests', () => {
    describe('GET /api/menus', () => {
        it('should get all menus for authenticated user', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)
            await createTestMenu(restaurant._id, { name: 'Menu 1' })
            await createTestMenu(restaurant._id, { name: 'Menu 2' })

            const response = await request(app)
                .get('/api/menus')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)

            assertPaginationResponse(response)
            expect(response.body.data).toHaveLength(2)
        })

        it('should not show other users menus', async () => {
            const { user: user1, token: token1 } = await createTestUser()
            const { user: user2 } = await createTestUser()

            const restaurant1 = await createTestRestaurant(user1._id)
            const restaurant2 = await createTestRestaurant(user2._id)

            await createTestMenu(restaurant1._id, { name: 'User 1 Menu' })
            await createTestMenu(restaurant2._id, { name: 'User 2 Menu' })

            const response = await request(app)
                .get('/api/menus')
                .set('Authorization', `Bearer ${token1}`)
                .expect(200)

            expect(response.body.data).toHaveLength(1)
            expect(response.body.data[0].name).toBe('User 1 Menu')
        })

        it('should show all menus for admin', async () => {
            const { user: user1 } = await createTestUser()
            const { user: user2 } = await createTestUser()
            const { user: admin, token: adminToken } = await createTestAdmin()

            const restaurant1 = await createTestRestaurant(user1._id)
            const restaurant2 = await createTestRestaurant(user2._id)
            const adminRestaurant = await createTestRestaurant(admin._id)

            await createTestMenu(restaurant1._id)
            await createTestMenu(restaurant2._id)
            await createTestMenu(adminRestaurant._id)

            const response = await request(app)
                .get('/api/menus')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)

            expect(response.body.data.length).toBeGreaterThanOrEqual(3)
        })

        it('should support pagination', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)

            // Create 15 menus
            for (let i = 0; i < 15; i++) {
                await createTestMenu(restaurant._id, { name: `Menu ${i}` })
            }

            const response = await request(app)
                .get('/api/menus?page=1&limit=10')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)

            expect(response.body.data).toHaveLength(10)
            expect(response.body.pagination.page).toBe(1)
            expect(response.body.pagination.total).toBe(15)
            expect(response.body.pagination.pages).toBe(2)
        })

        it('should support search by name', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)
            await createTestMenu(restaurant._id, { name: 'Dinner Menu' })
            await createTestMenu(restaurant._id, { name: 'Lunch Specials' })

            const response = await request(app)
                .get('/api/menus?name=Dinner')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)

            expect(response.body.data).toHaveLength(1)
            expect(response.body.data[0].name).toBe('Dinner Menu')
        })

        it('should support filtering by restaurantId', async () => {
            const { user, token } = await createTestUser()
            const restaurant1 = await createTestRestaurant(user._id)
            const restaurant2 = await createTestRestaurant(user._id)

            await createTestMenu(restaurant1._id, { name: 'Restaurant 1 Menu' })
            await createTestMenu(restaurant2._id, { name: 'Restaurant 2 Menu' })

            const response = await request(app)
                .get(`/api/menus?restaurantId=${restaurant1._id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)

            expect(response.body.data).toHaveLength(1)
            expect(response.body.data[0].name).toBe('Restaurant 1 Menu')
        })

        it('should support sorting', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)
            await createTestMenu(restaurant._id, { name: 'Zebra Menu' })
            await createTestMenu(restaurant._id, { name: 'Apple Menu' })

            const response = await request(app)
                .get('/api/menus?sortBy=name&order=asc')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)

            expect(response.body.data[0].name).toBe('Apple Menu')
            expect(response.body.data[1].name).toBe('Zebra Menu')
        })

        it('should require authentication', async () => {
            await request(app).get('/api/menus').expect(401)
        })
    })

    describe('GET /api/menus/:id', () => {
        it('should get menu by id for owner', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)
            const menu = await createTestMenu(restaurant._id)

            const response = await request(app)
                .get(`/api/menus/${menu._id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)

            assertSuccessResponse(response)
            expect(response.body.data._id).toBe(menu._id.toString())
            expect(response.body.data.name).toBe(menu.name)
        })

        it('should populate restaurant information', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id, { name: 'Test Restaurant' })
            const menu = await createTestMenu(restaurant._id)

            const response = await request(app)
                .get(`/api/menus/${menu._id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)

            expect(response.body.data.restaurantId).toBeDefined()
            expect(response.body.data.restaurantId.name).toBe('Test Restaurant')
        })

        it('should populate menu items', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)
            const menu = await createTestMenu(restaurant._id)
            await createTestMenuItem(menu._id, { name: 'Item 1' })
            await createTestMenuItem(menu._id, { name: 'Item 2' })

            const response = await request(app)
                .get(`/api/menus/${menu._id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)

            expect(response.body.data.menuItems).toBeDefined()
            expect(response.body.data.menuItems).toHaveLength(2)
        })

        it('should not allow non-owner to get menu', async () => {
            const { user: owner } = await createTestUser()
            const { user: other, token: otherToken } = await createTestUser()
            const restaurant = await createTestRestaurant(owner._id)
            const menu = await createTestMenu(restaurant._id)

            await request(app)
                .get(`/api/menus/${menu._id}`)
                .set('Authorization', `Bearer ${otherToken}`)
                .expect(403)
        })

        it('should allow admin to get any menu', async () => {
            const { user: owner } = await createTestUser()
            const { user: admin, token: adminToken } = await createTestAdmin()
            const restaurant = await createTestRestaurant(owner._id)
            const menu = await createTestMenu(restaurant._id)

            const response = await request(app)
                .get(`/api/menus/${menu._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)

            expect(response.body.data._id).toBe(menu._id.toString())
        })

        it('should return 404 for non-existent menu', async () => {
            const { token } = await createTestUser()

            await request(app)
                .get('/api/menus/507f1f77bcf86cd799439011')
                .set('Authorization', `Bearer ${token}`)
                .expect(404)
        })

        it('should require authentication', async () => {
            const { user } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)
            const menu = await createTestMenu(restaurant._id)

            await request(app).get(`/api/menus/${menu._id}`).expect(401)
        })
    })

    describe('POST /api/menus', () => {
        it('should create menu with valid data', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)
            const menuData = {
                name: 'New Menu',
                description: 'A great menu',
                restaurantId: restaurant._id.toString(),
                categories: ['Appetizers', 'Main Course', 'Desserts'],
            }

            const response = await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${token}`)
                .send(menuData)
                .expect(201)
            assertSuccessResponse(response)
            expect(response.body.data.name).toBe(menuData.name)
            expect(response.body.data.description).toBe(menuData.description)
            expect(response.body.data.categories).toEqual(menuData.categories)
        })

        it('should generate QR code on menu creation', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)
            const menuData = {
                name: 'Menu with QR',
                restaurantId: restaurant._id.toString(),
            }

            const response = await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${token}`)
                .send(menuData)
                .expect(201)

            expect(response.body.data.qrCodeUrl).toBeDefined()
            expect(response.body.data.qrCodeUrl).toContain('cloudinary.com')
        })

        it('should reject menu creation for non-owned restaurant', async () => {
            const { user: owner } = await createTestUser()
            const { user: other, token: otherToken } = await createTestUser()
            const restaurant = await createTestRestaurant(owner._id)

            const menuData = {
                name: 'Unauthorized Menu',
                restaurantId: restaurant._id.toString(),
            }

            await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${otherToken}`)
                .send(menuData)
                .expect(403)
        })

        it('should reject menu with invalid data', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)
            const invalidData = {
                name: 'AB', // Too short
                restaurantId: restaurant._id.toString(),
            }

            const response = await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${token}`)
                .send(invalidData)

            expect([400, 422]).toContain(response.status)
        })

        it('should reject menu without restaurantId', async () => {
            const { token } = await createTestUser()
            const menuData = {
                name: 'Menu Without Restaurant',
                description: 'This should fail',
            }

            const response = await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${token}`)
                .send(menuData)

            // Accept either 400 or 422 since middleware might reject before validation
            expect([400, 422]).toContain(response.status)
        })

        it('should require authentication', async () => {
            const menuData = {
                name: 'Unauthorized Menu',
                restaurantId: '507f1f77bcf86cd799439011',
            }

            await request(app).post('/api/menus').send(menuData).expect(401)
        })

        it('should set default values correctly', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)
            const menuData = {
                name: 'Minimal Menu',
                restaurantId: restaurant._id.toString(),
            }

            const response = await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${token}`)
                .send(menuData)
                .expect(201)

            expect(response.body.data.isActive).toBe(true)
            expect(response.body.data.categories).toEqual([])
            expect(response.body.data.imageUrls).toEqual([])
        })
    })

    describe('PUT /api/menus/:id', () => {
        it('should update menu with valid data', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)
            const menu = await createTestMenu(restaurant._id)

            const updateData = {
                name: 'Updated Menu Name',
                description: 'Updated description',
                isActive: false,
            }

            const response = await request(app)
                .put(`/api/menus/${menu._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData)
                .expect(200)

            assertSuccessResponse(response)
            expect(response.body.data.name).toBe(updateData.name)
            expect(response.body.data.description).toBe(updateData.description)
            expect(response.body.data.isActive).toBe(false)
        })

        it('should update categories', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)
            const menu = await createTestMenu(restaurant._id, {
                categories: ['Old Category'],
            })

            const updateData = {
                categories: ['Appetizers', 'Main Course', 'Desserts'],
            }

            const response = await request(app)
                .put(`/api/menus/${menu._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData)
                .expect(200)

            expect(response.body.data.categories).toEqual(updateData.categories)
        })

        it('should not allow non-owner to update menu', async () => {
            const { user: owner } = await createTestUser()
            const { user: other, token: otherToken } = await createTestUser()
            const restaurant = await createTestRestaurant(owner._id)
            const menu = await createTestMenu(restaurant._id)

            await request(app)
                .put(`/api/menus/${menu._id}`)
                .set('Authorization', `Bearer ${otherToken}`)
                .send({ name: 'Hacked Name' })
                .expect(403)
        })

        it('should allow admin to update any menu', async () => {
            const { user: owner } = await createTestUser()
            const { user: admin, token: adminToken } = await createTestAdmin()
            const restaurant = await createTestRestaurant(owner._id)
            const menu = await createTestMenu(restaurant._id)

            const response = await request(app)
                .put(`/api/menus/${menu._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Admin Updated Name' })
                .expect(200)

            expect(response.body.data.name).toBe('Admin Updated Name')
        })

        it('should reject invalid updates', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)
            const menu = await createTestMenu(restaurant._id)

            await request(app)
                .put(`/api/menus/${menu._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'A' }) // Too short
                .expect(422)
        })

        it('should not allow updating restaurantId', async () => {
            const { user, token } = await createTestUser()
            const restaurant1 = await createTestRestaurant(user._id)
            const restaurant2 = await createTestRestaurant(user._id)
            const menu = await createTestMenu(restaurant1._id)

            const response = await request(app)
                .put(`/api/menus/${menu._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ restaurantId: restaurant2._id.toString() })
                .expect(200)

            // restaurantId should remain unchanged since it's not in updateSchema
            expect(response.body.data.restaurantId).toBe(restaurant1._id.toString())
        })

        it('should require authentication', async () => {
            const { user } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)
            const menu = await createTestMenu(restaurant._id)

            await request(app)
                .put(`/api/menus/${menu._id}`)
                .send({ name: 'New Name' })
                .expect(401)
        })
    })

    describe('DELETE /api/menus/:id', () => {
        it('should delete menu and cascade delete menu items', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)
            const menu = await createTestMenu(restaurant._id)
            const menuItem1 = await createTestMenuItem(menu._id)
            const menuItem2 = await createTestMenuItem(menu._id)

            await request(app)
                .delete(`/api/menus/${menu._id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(204)

            // Verify menu is deleted
            const deletedMenu = await Menu.findById(menu._id)
            expect(deletedMenu).toBeNull()

            // Verify menu items are deleted
            const deletedItem1 = await MenuItem.findById(menuItem1._id)
            const deletedItem2 = await MenuItem.findById(menuItem2._id)
            expect(deletedItem1).toBeNull()
            expect(deletedItem2).toBeNull()
        })

        it('should not delete restaurant when deleting menu', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)
            const menu = await createTestMenu(restaurant._id)

            await request(app)
                .delete(`/api/menus/${menu._id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(204)

            // Verify restaurant still exists
            const Restaurant = require('@modules/restaurants/models/restaurant')
            const existingRestaurant = await Restaurant.findById(restaurant._id)
            expect(existingRestaurant).not.toBeNull()
        })

        it('should not allow non-owner to delete menu', async () => {
            const { user: owner } = await createTestUser()
            const { user: other, token: otherToken } = await createTestUser()
            const restaurant = await createTestRestaurant(owner._id)
            const menu = await createTestMenu(restaurant._id)

            await request(app)
                .delete(`/api/menus/${menu._id}`)
                .set('Authorization', `Bearer ${otherToken}`)
                .expect(403)

            // Verify menu still exists
            const existingMenu = await Menu.findById(menu._id)
            expect(existingMenu).not.toBeNull()
        })

        it('should allow admin to delete any menu', async () => {
            const { user: owner } = await createTestUser()
            const { user: admin, token: adminToken } = await createTestAdmin()
            const restaurant = await createTestRestaurant(owner._id)
            const menu = await createTestMenu(restaurant._id)

            await request(app)
                .delete(`/api/menus/${menu._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(204)

            const deletedMenu = await Menu.findById(menu._id)
            expect(deletedMenu).toBeNull()
        })

        it('should require authentication', async () => {
            const { user } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)
            const menu = await createTestMenu(restaurant._id)

            await request(app).delete(`/api/menus/${menu._id}`).expect(401)
        })
    })

    describe('POST /api/menus/:id/qrcode', () => {
        it('should generate QR code for existing menu', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)
            const menu = await createTestMenu(restaurant._id)

            const response = await request(app)
                .post(`/api/menus/${menu._id}/qrcode`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)

            assertSuccessResponse(response)
            expect(response.body.data.qrCodeUrl).toBeDefined()
            expect(response.body.data.qrCodeData).toBeDefined()
            expect(response.body.data.qrCodeData.downloadUrl).toBeDefined()
            expect(response.body.data.qrCodeData.url).toContain(`/r/${menu._id}`)
        })

        it('should update menu with new QR code URL', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)
            const menu = await createTestMenu(restaurant._id, { qrCodeUrl: null })

            await request(app)
                .post(`/api/menus/${menu._id}/qrcode`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)

            // Verify menu was updated
            const updatedMenu = await Menu.findById(menu._id)
            expect(updatedMenu.qrCodeUrl).toBeDefined()
            expect(updatedMenu.qrCodeUrl).not.toBeNull()
        })

        it('should not allow non-owner to generate QR code', async () => {
            const { user: owner } = await createTestUser()
            const { user: other, token: otherToken } = await createTestUser()
            const restaurant = await createTestRestaurant(owner._id)
            const menu = await createTestMenu(restaurant._id)

            await request(app)
                .post(`/api/menus/${menu._id}/qrcode`)
                .set('Authorization', `Bearer ${otherToken}`)
                .expect(403)
        })

        it('should allow admin to generate QR code for any menu', async () => {
            const { user: owner } = await createTestUser()
            const { user: admin, token: adminToken } = await createTestAdmin()
            const restaurant = await createTestRestaurant(owner._id)
            const menu = await createTestMenu(restaurant._id)

            const response = await request(app)
                .post(`/api/menus/${menu._id}/qrcode`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)

            expect(response.body.data.qrCodeUrl).toBeDefined()
        })

        it('should return 404 for non-existent menu', async () => {
            const { token } = await createTestUser()

            await request(app)
                .post('/api/menus/507f1f77bcf86cd799439011/qrcode')
                .set('Authorization', `Bearer ${token}`)
                .expect(404)
        })

        it('should require authentication', async () => {
            const { user } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)
            const menu = await createTestMenu(restaurant._id)

            await request(app).post(`/api/menus/${menu._id}/qrcode`).expect(401)
        })
    })

    describe('Multi-User Menu Isolation', () => {
        it('should maintain complete isolation between users', async () => {
            const { user: user1, token: token1 } = await createTestUser()
            const { user: user2, token: token2 } = await createTestUser()

            const restaurant1 = await createTestRestaurant(user1._id)
            const restaurant2 = await createTestRestaurant(user2._id)

            const menu1 = await createTestMenu(restaurant1._id, {
                name: 'User 1 Menu',
            })
            const menu2 = await createTestMenu(restaurant2._id, {
                name: 'User 2 Menu',
            })

            // User 1 can see their own menu
            const user1Response = await request(app)
                .get('/api/menus')
                .set('Authorization', `Bearer ${token1}`)
                .expect(200)

            expect(user1Response.body.data).toHaveLength(1)
            expect(user1Response.body.data[0]._id).toBe(menu1._id.toString())

            // User 2 can see their own menu
            const user2Response = await request(app)
                .get('/api/menus')
                .set('Authorization', `Bearer ${token2}`)
                .expect(200)

            expect(user2Response.body.data).toHaveLength(1)
            expect(user2Response.body.data[0]._id).toBe(menu2._id.toString())

            // User 1 cannot access User 2's menu
            await request(app)
                .get(`/api/menus/${menu2._id}`)
                .set('Authorization', `Bearer ${token1}`)
                .expect(403)

            // User 2 cannot access User 1's menu
            await request(app)
                .get(`/api/menus/${menu1._id}`)
                .set('Authorization', `Bearer ${token2}`)
                .expect(403)
        })

        it('should prevent cross-user menu modifications', async () => {
            const { user: user1 } = await createTestUser()
            const { user: user2, token: token2 } = await createTestUser()

            const restaurant1 = await createTestRestaurant(user1._id)
            const menu1 = await createTestMenu(restaurant1._id, { name: 'Original Name' })

            // User 2 tries to update User 1's menu
            await request(app)
                .put(`/api/menus/${menu1._id}`)
                .set('Authorization', `Bearer ${token2}`)
                .send({ name: 'Hacked Name' })
                .expect(403)

            // Verify menu was not modified
            const unchangedMenu = await Menu.findById(menu1._id)
            expect(unchangedMenu.name).toBe('Original Name')
        })
    })

    describe('Complete Menu Lifecycle', () => {
        it('should handle full CRUD lifecycle', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)

            // Create
            const createData = {
                name: 'Lifecycle Menu',
                description: 'Initial description',
                restaurantId: restaurant._id.toString(),
                categories: ['Starters', 'Mains'],
            }

            const createResponse = await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${token}`)
                .send(createData)
                .expect(201)

            const menuId = createResponse.body.data._id
            expect(createResponse.body.data.qrCodeUrl).toBeDefined()

            // Read
            const getResponse = await request(app)
                .get(`/api/menus/${menuId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)

            expect(getResponse.body.data.name).toBe(createData.name)
            expect(getResponse.body.data.categories).toEqual(createData.categories)

            // Update
            const updateData = {
                name: 'Updated Lifecycle Menu',
                description: 'Updated description',
                categories: ['Starters', 'Mains', 'Desserts'],
            }

            const updateResponse = await request(app)
                .put(`/api/menus/${menuId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData)
                .expect(200)

            expect(updateResponse.body.data.name).toBe(updateData.name)
            expect(updateResponse.body.data.categories).toEqual(updateData.categories)

            // Generate new QR code
            await request(app)
                .post(`/api/menus/${menuId}/qrcode`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)

            // Delete
            await request(app)
                .delete(`/api/menus/${menuId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(204)

            // Verify deletion
            await request(app)
                .get(`/api/menus/${menuId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(404)
        })

        it('should handle menu with items lifecycle', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)

            // Create menu
            const createData = {
                name: 'Menu with Items',
                restaurantId: restaurant._id.toString(),
            }

            const createResponse = await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${token}`)
                .send(createData)
                .expect(201)

            const menuId = createResponse.body.data._id

            // Add menu items
            await createTestMenuItem(menuId, { name: 'Item 1' })
            await createTestMenuItem(menuId, { name: 'Item 2' })
            await createTestMenuItem(menuId, { name: 'Item 3' })

            // Read menu with items
            const getResponse = await request(app)
                .get(`/api/menus/${menuId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)

            expect(getResponse.body.data.menuItems).toHaveLength(3)

            // Delete menu (should cascade delete items)
            await request(app)
                .delete(`/api/menus/${menuId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(204)

            // Verify all items were deleted
            const remainingItems = await MenuItem.find({ menuId })
            expect(remainingItems).toHaveLength(0)
        })
    })

    describe('Menu Validation Edge Cases', () => {
        it('should handle menu name with special characters', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)

            const menuData = {
                name: "O'Brien's Menu & More",
                restaurantId: restaurant._id.toString(),
            }

            const response = await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${token}`)
                .send(menuData)
                .expect(201)

            expect(response.body.data.name).toBe(menuData.name)
        })

        it('should handle empty description', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)

            const menuData = {
                name: 'Menu with Empty Description',
                description: '',
                restaurantId: restaurant._id.toString(),
            }

            const response = await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${token}`)
                .send(menuData)
                .expect(201)

            expect(response.body.data.description).toBe('')
        })

        it('should handle maximum length description', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)

            const longDescription = 'A'.repeat(500)
            const menuData = {
                name: 'Menu with Long Description',
                description: longDescription,
                restaurantId: restaurant._id.toString(),
            }

            const response = await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${token}`)
                .send(menuData)
                .expect(201)

            expect(response.body.data.description).toBe(longDescription)
        })

        it('should reject description exceeding maximum length', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)

            const tooLongDescription = 'A'.repeat(501)
            const menuData = {
                name: 'Menu with Too Long Description',
                description: tooLongDescription,
                restaurantId: restaurant._id.toString(),
            }

            await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${token}`)
                .send(menuData)
                .expect(422)
        })

        it('should handle multiple categories', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)

            const categories = [
                'Appetizers',
                'Soups',
                'Salads',
                'Main Course',
                'Sides',
                'Desserts',
                'Beverages',
            ]

            const menuData = {
                name: 'Comprehensive Menu',
                restaurantId: restaurant._id.toString(),
                categories,
            }

            const response = await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${token}`)
                .send(menuData)
                .expect(201)

            expect(response.body.data.categories).toEqual(categories)
        })
    })

    describe('Concurrent Operations', () => {
        it('should handle concurrent menu creation', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)

            const createPromises = Array.from({ length: 5 }, (_, i) =>
                request(app)
                    .post('/api/menus')
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        name: `Concurrent Menu ${i}`,
                        restaurantId: restaurant._id.toString(),
                    })
            )

            const responses = await Promise.all(createPromises)

            responses.forEach(response => {
                expect(response.status).toBe(201)
                expect(response.body.success).toBe(true)
                expect(response.body.data.qrCodeUrl).toBeDefined()
            })

            // Verify all menus were created
            const menus = await Menu.find({ restaurantId: restaurant._id })
            expect(menus).toHaveLength(5)
        })

        it('should handle concurrent menu updates', async () => {
            const { user, token } = await createTestUser()
            const restaurant = await createTestRestaurant(user._id)
            const menu = await createTestMenu(restaurant._id)

            const updatePromises = Array.from({ length: 3 }, (_, i) =>
                request(app)
                    .put(`/api/menus/${menu._id}`)
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        description: `Updated description ${i}`,
                    })
            )

            const responses = await Promise.all(updatePromises)

            responses.forEach(response => {
                expect(response.status).toBe(200)
                expect(response.body.success).toBe(true)
            })

            // Verify final state
            const finalMenu = await Menu.findById(menu._id)
            expect(finalMenu).toBeDefined()
        })
    })
})

