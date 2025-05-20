export const RESTAURANT_FORM_STEPS = [
    { id: 'basic-info', title: 'Basic Info' },
    { id: 'location', title: 'Location' },
    { id: 'hours', title: 'Business Hours' },
    { id: 'logo', title: 'Logo' },
] as const

export const FORM_DEFAULT_VALUES = {
    name: 'test name',
    description: 'test description',
    contact: {
        phone: '+1234567890',
        email: 'test@test.com',
        website: 'https://test.com',
    },
    location: {
        street: 'test street',
        houseNumber: '123',
        city: 'test city',
        zipCode: '12345',
    },
    hours: Array(7).fill(null).map((_, index) => ({
        day: index,
        closed: true,
    })),
    isActive: true,
} as const

export const VALIDATION_MESSAGES = {
    REQUIRED: 'This field is required',
    MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
    MAX_LENGTH: (max: number) => `Cannot exceed ${max} characters`,
    INVALID_EMAIL: 'Invalid email address',
    INVALID_PHONE: 'Phone must start with + followed by digits',
    INVALID_WEBSITE: 'Invalid website URL',
    INVALID_ZIP: 'Invalid zip code format',
    INVALID_TIME: 'Invalid time format (HH:MM)',
} as const

export const FILE_CONSTRAINTS = {
    MAX_SIZE: 5 * 1024 * 1024,
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const 