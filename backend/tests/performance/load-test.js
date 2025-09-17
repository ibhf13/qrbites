import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend, Counter } from 'k6/metrics'
import { randomString, randomItem, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js'

// Custom metrics
const errorRate = new Rate('errors')
const responseTime = new Trend('response_time')
const apiCalls = new Counter('api_calls')
const authSuccessRate = new Rate('auth_success')
const uploadSuccessRate = new Rate('upload_success')

// Test configuration
const API_BASE_URL = __ENV.API_BASE_URL || 'http://localhost:5000'
const TEST_DURATION = __ENV.TEST_DURATION || '5m'
const TARGET_VUS = __ENV.TARGET_VUS || 50

// Test scenarios
export const options = {
    scenarios: {
        // Smoke test - basic functionality
        smoke_test: {
            executor: 'constant-vus',
            vus: 1,
            duration: '1m',
            tags: { test_type: 'smoke' },
        },

        // Load test - normal expected load
        load_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '2m', target: 10 },
                { duration: '5m', target: 20 },
                { duration: '2m', target: 0 },
            ],
            tags: { test_type: 'load' },
        },

        // Stress test - peak load conditions
        stress_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '2m', target: 20 },
                { duration: '5m', target: 50 },
                { duration: '3m', target: 80 },
                { duration: '2m', target: 100 },
                { duration: '5m', target: 0 },
            ],
            tags: { test_type: 'stress' },
        },

        // Spike test - sudden traffic spikes
        spike_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '10s', target: 100 },
                { duration: '1m', target: 100 },
                { duration: '10s', target: 1400 },
                { duration: '3m', target: 1400 },
                { duration: '10s', target: 100 },
                { duration: '3m', target: 100 },
                { duration: '10s', target: 0 },
            ],
            tags: { test_type: 'spike' },
        },

        // Soak test - extended duration testing
        soak_test: {
            executor: 'constant-vus',
            vus: 20,
            duration: '1h',
            tags: { test_type: 'soak' },
        },

        // API-specific scenarios
        auth_heavy: {
            executor: 'constant-vus',
            vus: 10,
            duration: '3m',
            exec: 'authScenario',
            tags: { test_type: 'auth' },
        },

        file_upload_test: {
            executor: 'constant-vus',
            vus: 5,
            duration: '2m',
            exec: 'fileUploadScenario',
            tags: { test_type: 'upload' },
        },

        database_heavy: {
            executor: 'constant-vus',
            vus: 15,
            duration: '3m',
            exec: 'databaseIntensiveScenario',
            tags: { test_type: 'database' },
        }
    },

    thresholds: {
        http_req_duration: ['p(95)<2000', 'p(99)<5000'], // 95% < 2s, 99% < 5s
        http_req_failed: ['rate<0.1'], // Error rate < 10%
        errors: ['rate<0.05'], // Custom error rate < 5%
        response_time: ['p(95)<1500'],
        auth_success: ['rate>0.95'], // Auth success rate > 95%
        upload_success: ['rate>0.9'], // Upload success rate > 90%
    },
}

// Test data generators
const testUsers = [
    { email: 'testuser1@example.com', password: 'TestPass123' },
    { email: 'testuser2@example.com', password: 'TestPass123' },
    { email: 'testuser3@example.com', password: 'TestPass123' },
    { email: 'admin@example.com', password: 'AdminPass123' },
]

const sampleRestaurants = [
    { name: 'Test Pizza Palace', description: 'Best pizza in town', cuisine: 'Italian' },
    { name: 'Burger Junction', description: 'Gourmet burgers', cuisine: 'American' },
    { name: 'Sushi Zen', description: 'Fresh sushi daily', cuisine: 'Japanese' },
    { name: 'Taco Fiesta', description: 'Authentic Mexican food', cuisine: 'Mexican' },
]

const sampleMenuItems = [
    { name: 'Margherita Pizza', description: 'Classic tomato and mozzarella', price: 12.99, category: 'Pizza' },
    { name: 'Cheeseburger', description: 'Beef patty with cheese', price: 8.99, category: 'Burgers' },
    { name: 'California Roll', description: 'Avocado and cucumber', price: 6.99, category: 'Sushi' },
    { name: 'Fish Tacos', description: 'Grilled fish with salsa', price: 9.99, category: 'Tacos' },
]

// Utility functions
function generateTestUser() {
    return {
        email: `testuser${randomIntBetween(1000, 9999)}@loadtest.com`,
        password: 'LoadTest123'
    }
}

function generateRestaurantData() {
    const restaurant = randomItem(sampleRestaurants)
    return {
        ...restaurant,
        name: `${restaurant.name} ${randomIntBetween(1, 1000)}`,
        phone: `555-${randomIntBetween(1000, 9999)}`,
        address: {
            street: `${randomIntBetween(1, 999)} Test St`,
            city: 'Test City',
            state: 'TS',
            zipCode: `${randomIntBetween(10000, 99999)}`
        }
    }
}

function authenticateUser(user) {
    const loginResponse = http.post(`${API_BASE_URL}/api/auth/login`, JSON.stringify(user), {
        headers: { 'Content-Type': 'application/json' },
        tags: { endpoint: 'auth/login' },
    })

    const loginSuccess = check(loginResponse, {
        'login successful': (r) => r.status === 200,
        'token received': (r) => r.json('data.token') !== undefined,
    })

    authSuccessRate.add(loginSuccess)

    if (loginSuccess) {
        return loginResponse.json('data.token')
    }

    return null
}

function createAuthHeaders(token) {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

// Main test scenario
export default function () {
    const testType = __ITER % 4

    switch (testType) {
        case 0:
            publicEndpointsTest()
            break
        case 1:
            authenticationFlowTest()
            break
        case 2:
            restaurantManagementTest()
            break
        case 3:
            menuManagementTest()
            break
        default:
            publicEndpointsTest()
    }

    sleep(randomIntBetween(1, 3))
}

// Test scenarios

export function publicEndpointsTest() {
    // Health check
    let response = http.get(`${API_BASE_URL}/health`, {
        tags: { endpoint: 'health' },
    })

    check(response, {
        'health check status is 200': (r) => r.status === 200,
        'health check response time < 500ms': (r) => r.timings.duration < 500,
    })

    responseTime.add(response.timings.duration)
    apiCalls.add(1)

    // Public restaurants endpoint
    response = http.get(`${API_BASE_URL}/api/public/restaurants`, {
        tags: { endpoint: 'public/restaurants' },
    })

    const publicSuccess = check(response, {
        'public restaurants status is 200': (r) => r.status === 200,
        'public restaurants has data': (r) => r.json('data') !== undefined,
        'public restaurants response time < 1s': (r) => r.timings.duration < 1000,
    })

    if (!publicSuccess) {
        errorRate.add(1)
    } else {
        errorRate.add(0)
    }

    responseTime.add(response.timings.duration)
    apiCalls.add(1)

    sleep(1)
}

export function authenticationFlowTest() {
    const user = generateTestUser()

    // Register user
    let response = http.post(`${API_BASE_URL}/api/auth/register`, JSON.stringify(user), {
        headers: { 'Content-Type': 'application/json' },
        tags: { endpoint: 'auth/register' },
    })

    const registerSuccess = check(response, {
        'registration successful': (r) => r.status === 201 || r.status === 400, // 400 if user exists
        'registration response time < 2s': (r) => r.timings.duration < 2000,
    })

    responseTime.add(response.timings.duration)
    apiCalls.add(1)

    // Login with existing user
    const existingUser = randomItem(testUsers)
    const token = authenticateUser(existingUser)

    if (token) {
        // Get user profile
        response = http.get(`${API_BASE_URL}/api/auth/me`, {
            headers: createAuthHeaders(token),
            tags: { endpoint: 'auth/me' },
        })

        check(response, {
            'profile fetch successful': (r) => r.status === 200,
            'profile has user data': (r) => r.json('data.email') !== undefined,
        })

        responseTime.add(response.timings.duration)
        apiCalls.add(1)
    }

    sleep(1)
}

export function restaurantManagementTest() {
    const user = randomItem(testUsers)
    const token = authenticateUser(user)

    if (!token) return

    const restaurantData = generateRestaurantData()

    // Create restaurant
    let response = http.post(`${API_BASE_URL}/api/restaurants`, JSON.stringify(restaurantData), {
        headers: createAuthHeaders(token),
        tags: { endpoint: 'restaurants/create' },
    })

    const createSuccess = check(response, {
        'restaurant creation successful': (r) => r.status === 201,
        'restaurant has ID': (r) => r.json('data._id') !== undefined,
    })

    responseTime.add(response.timings.duration)
    apiCalls.add(1)

    if (createSuccess) {
        const restaurantId = response.json('data._id')

        // Get restaurant details
        response = http.get(`${API_BASE_URL}/api/restaurants/${restaurantId}`, {
            headers: createAuthHeaders(token),
            tags: { endpoint: 'restaurants/get' },
        })

        check(response, {
            'restaurant fetch successful': (r) => r.status === 200,
            'restaurant details correct': (r) => r.json('data.name') === restaurantData.name,
        })

        responseTime.add(response.timings.duration)
        apiCalls.add(1)

        // Update restaurant
        const updateData = { description: 'Updated description during load test' }
        response = http.put(`${API_BASE_URL}/api/restaurants/${restaurantId}`, JSON.stringify(updateData), {
            headers: createAuthHeaders(token),
            tags: { endpoint: 'restaurants/update' },
        })

        check(response, {
            'restaurant update successful': (r) => r.status === 200,
        })

        responseTime.add(response.timings.duration)
        apiCalls.add(1)

        sleep(1)

        // Generate QR code
        response = http.post(`${API_BASE_URL}/api/restaurants/${restaurantId}/qr-code`, null, {
            headers: createAuthHeaders(token),
            tags: { endpoint: 'restaurants/qr-code' },
        })

        check(response, {
            'QR code generation successful': (r) => r.status === 200,
            'QR code URL provided': (r) => r.json('data.qrCodeUrl') !== undefined,
        })

        responseTime.add(response.timings.duration)
        apiCalls.add(1)
    }

    sleep(1)
}

export function menuManagementTest() {
    const user = randomItem(testUsers)
    const token = authenticateUser(user)

    if (!token) return

    // First get user's restaurants
    let response = http.get(`${API_BASE_URL}/api/restaurants/my-restaurants`, {
        headers: createAuthHeaders(token),
        tags: { endpoint: 'restaurants/my-restaurants' },
    })

    const restaurants = response.json('data') || []

    if (restaurants.length === 0) {
        // Create a restaurant first
        const restaurantData = generateRestaurantData()
        response = http.post(`${API_BASE_URL}/api/restaurants`, JSON.stringify(restaurantData), {
            headers: createAuthHeaders(token),
            tags: { endpoint: 'restaurants/create' },
        })

        if (response.status === 201) {
            restaurants.push(response.json('data'))
        } else {
            return // Can't proceed without restaurant
        }
    }

    const restaurant = randomItem(restaurants)

    // Create menu
    const menuData = {
        name: `Test Menu ${randomIntBetween(1, 100)}`,
        description: 'Load test menu',
        restaurantId: restaurant._id
    }

    response = http.post(`${API_BASE_URL}/api/menus`, JSON.stringify(menuData), {
        headers: createAuthHeaders(token),
        tags: { endpoint: 'menus/create' },
    })

    const menuCreateSuccess = check(response, {
        'menu creation successful': (r) => r.status === 201,
        'menu has ID': (r) => r.json('data._id') !== undefined,
    })

    responseTime.add(response.timings.duration)
    apiCalls.add(1)

    if (menuCreateSuccess) {
        const menuId = response.json('data._id')

        // Add menu items
        for (let i = 0; i < 3; i++) {
            const itemData = {
                ...randomItem(sampleMenuItems),
                menuId: menuId,
                price: randomIntBetween(5, 25) + 0.99
            }

            response = http.post(`${API_BASE_URL}/api/menu-items`, JSON.stringify(itemData), {
                headers: createAuthHeaders(token),
                tags: { endpoint: 'menu-items/create' },
            })

            check(response, {
                'menu item creation successful': (r) => r.status === 201,
            })

            responseTime.add(response.timings.duration)
            apiCalls.add(1)

            sleep(0.5)
        }

        // Get menu with items
        response = http.get(`${API_BASE_URL}/api/menus/${menuId}?include=items`, {
            headers: createAuthHeaders(token),
            tags: { endpoint: 'menus/get-with-items' },
        })

        check(response, {
            'menu fetch with items successful': (r) => r.status === 200,
            'menu has items': (r) => r.json('data.items') && r.json('data.items').length > 0,
        })

        responseTime.add(response.timings.duration)
        apiCalls.add(1)
    }

    sleep(1)
}

// Specialized scenarios

export function authScenario() {
    // Focus on authentication endpoints
    for (let i = 0; i < 5; i++) {
        authenticationFlowTest()
        sleep(randomIntBetween(1, 2))
    }
}

export function fileUploadScenario() {
    const user = randomItem(testUsers)
    const token = authenticateUser(user)

    if (!token) return

    // Simulate file upload (multipart form data)
    const fakeImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='

    const formData = {
        image: http.file(fakeImageData, 'test-image.png', 'image/png'),
    }

    // Create restaurant first
    const restaurantData = generateRestaurantData()
    let response = http.post(`${API_BASE_URL}/api/restaurants`, JSON.stringify(restaurantData), {
        headers: createAuthHeaders(token),
    })

    if (response.status === 201) {
        const restaurantId = response.json('data._id')

        // Upload restaurant logo
        response = http.post(`${API_BASE_URL}/api/restaurants/${restaurantId}/logo`, formData, {
            headers: { 'Authorization': `Bearer ${token}` }, // Don't set Content-Type for multipart
            tags: { endpoint: 'restaurants/logo-upload' },
        })

        const uploadSuccess = check(response, {
            'logo upload successful': (r) => r.status === 200,
            'logo URL returned': (r) => r.json('data.logo') !== undefined,
        })

        uploadSuccessRate.add(uploadSuccess)
        responseTime.add(response.timings.duration)
        apiCalls.add(1)
    }

    sleep(2)
}

export function databaseIntensiveScenario() {
    // Test database-heavy operations
    const user = randomItem(testUsers)
    const token = authenticateUser(user)

    if (!token) return

    // Multiple restaurant queries
    for (let i = 0; i < 10; i++) {
        let response = http.get(`${API_BASE_URL}/api/public/restaurants?limit=50&offset=${i * 50}`, {
            tags: { endpoint: 'public/restaurants-paginated' },
        })

        check(response, {
            'restaurant list query successful': (r) => r.status === 200,
        })

        responseTime.add(response.timings.duration)
        apiCalls.add(1)

        sleep(0.1)
    }

    // Search operations
    const searchTerms = ['pizza', 'burger', 'sushi', 'taco', 'pasta']

    searchTerms.forEach(term => {
        let response = http.get(`${API_BASE_URL}/api/public/search?q=${term}&type=restaurants`, {
            tags: { endpoint: 'public/search' },
        })

        check(response, {
            'search query successful': (r) => r.status === 200,
        })

        responseTime.add(response.timings.duration)
        apiCalls.add(1)

        sleep(0.5)
    })
}

// Test lifecycle functions

export function setup() {
    console.log('🚀 Starting QrBites Load Test Suite')
    console.log(`Target: ${API_BASE_URL}`)
    console.log(`Duration: ${TEST_DURATION}`)
    console.log(`Max VUs: ${TARGET_VUS}`)

    // Warm up the API
    const warmupResponse = http.get(`${API_BASE_URL}/health`)
    if (warmupResponse.status !== 200) {
        console.error('❌ API warmup failed - service may be down')
    } else {
        console.log('✅ API warmup successful')
    }

    return { startTime: Date.now() }
}

export function teardown(data) {
    const duration = Date.now() - data.startTime
    console.log(`\n📊 Load Test Completed in ${Math.round(duration / 1000)}s`)
    console.log(`Total API Calls: ${apiCalls.count}`)
    console.log(`Average Response Time: ${responseTime.avg}ms`)
    console.log(`Error Rate: ${(errorRate.rate * 100).toFixed(2)}%`)
    console.log(`Auth Success Rate: ${(authSuccessRate.rate * 100).toFixed(2)}%`)

    // Cleanup test data (optional)
    console.log('🧹 Cleaning up test data...')
}