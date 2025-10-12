const mongoose = require('mongoose')
const User = require('../user')
const { userFactory } = require('../../../../../__tests__/helpers/factories')

describe('User Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid user with required fields', async () => {
      const userData = userFactory.build()
      const user = await User.create(userData)

      expect(user._id).toBeDefined()
      expect(user.email).toBe(userData.email.toLowerCase())
      expect(user.name).toBe(userData.name)
      expect(user.role).toBe('user')
      expect(user.isActive).toBe(true)
      expect(user.createdAt).toBeDefined()
      expect(user.updatedAt).toBeDefined()
    })

    it('should require email field', async () => {
      const userData = userFactory.build({ email: undefined })
      
      await expect(User.create(userData)).rejects.toThrow()
    })

    it('should require password field', async () => {
      const userData = userFactory.build({ password: undefined })
      
      await expect(User.create(userData)).rejects.toThrow()
    })

    it('should enforce unique email constraint', async () => {
      const userData = userFactory.build()
      await User.create(userData)

      await expect(User.create(userData)).rejects.toThrow()
    })

    it('should trim and lowercase email', async () => {
      const userData = userFactory.build({ email: '  TEST@EXAMPLE.COM  ' })
      const user = await User.create(userData)

      expect(user.email).toBe('test@example.com')
    })

    it('should enforce minimum password length of 6 characters', async () => {
      const userData = userFactory.build({ password: '12345' })
      
      await expect(User.create(userData)).rejects.toThrow()
    })

    it('should enforce minimum name length of 2 characters', async () => {
      const userData = userFactory.build({ name: 'A' })
      
      await expect(User.create(userData)).rejects.toThrow()
    })

    it('should enforce maximum name length of 50 characters', async () => {
      const userData = userFactory.build({ 
        name: 'A'.repeat(51) 
      })
      
      await expect(User.create(userData)).rejects.toThrow()
    })

    it('should accept valid name lengths', async () => {
      const userData = userFactory.build({ name: 'John Doe' })
      const user = await User.create(userData)

      expect(user.name).toBe('John Doe')
    })

    it('should default role to "user"', async () => {
      const userData = userFactory.build({ role: undefined })
      const user = await User.create(userData)

      expect(user.role).toBe('user')
    })

    it('should accept "admin" role', async () => {
      const userData = userFactory.buildAdmin()
      const user = await User.create(userData)

      expect(user.role).toBe('admin')
    })

    it('should only accept valid role values', async () => {
      const userData = userFactory.build({ role: 'superuser' })
      
      await expect(User.create(userData)).rejects.toThrow()
    })

    it('should default isActive to true', async () => {
      const userData = userFactory.build({ isActive: undefined })
      const user = await User.create(userData)

      expect(user.isActive).toBe(true)
    })

    it('should accept isActive as false', async () => {
      const userData = userFactory.buildInactive()
      const user = await User.create(userData)

      expect(user.isActive).toBe(false)
    })
  })

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const plainPassword = 'MyPassword123!'
      const userData = userFactory.build({ password: plainPassword })
      const user = await User.create(userData)

      expect(user.password).toBeDefined()
      expect(user.password).not.toBe(plainPassword)
      expect(user.password.length).toBeGreaterThan(20) // Bcrypt hashes are long
    })

    it('should hash password on update if modified', async () => {
      const userData = userFactory.build()
      const user = await User.create(userData)
      const originalHash = user.password

      user.password = 'NewPassword123!'
      await user.save()

      expect(user.password).not.toBe(originalHash)
      expect(user.password).not.toBe('NewPassword123!')
    })

    it('should not rehash password if not modified', async () => {
      const userData = userFactory.build()
      const user = await User.create(userData)
      const originalHash = user.password

      user.name = 'Updated Name'
      await user.save()

      expect(user.password).toBe(originalHash)
    })
  })

  describe('comparePassword Method', () => {
    it('should return true for correct password', async () => {
      const plainPassword = 'CorrectPassword123!'
      const userData = userFactory.build({ password: plainPassword })
      const user = await User.create(userData)

      const isMatch = await user.comparePassword(plainPassword)
      expect(isMatch).toBe(true)
    })

    it('should return false for incorrect password', async () => {
      const userData = userFactory.build({ password: 'CorrectPassword123!' })
      const user = await User.create(userData)

      const isMatch = await user.comparePassword('WrongPassword123!')
      expect(isMatch).toBe(false)
    })

    it('should handle empty password', async () => {
      const userData = userFactory.build({ password: 'CorrectPassword123!' })
      const user = await User.create(userData)

      const isMatch = await user.comparePassword('')
      expect(isMatch).toBe(false)
    })
  })

  describe('Virtual Fields', () => {
    it('should return displayName as name when name exists', async () => {
      const userData = userFactory.build({ name: 'John Doe' })
      const user = await User.create(userData)

      expect(user.displayName).toBe('John Doe')
    })

    it('should return "Anonymous User" when name is not provided', async () => {
      const userData = userFactory.build({ name: undefined })
      const user = await User.create(userData)

      expect(user.displayName).toBe('Anonymous User')
    })

    it('should include virtuals in JSON output', async () => {
      const userData = userFactory.build({ name: 'Jane Doe' })
      const user = await User.create(userData)
      const userJSON = user.toJSON()

      expect(userJSON.displayName).toBe('Jane Doe')
    })

    it('should include virtuals in object output', async () => {
      const userData = userFactory.build({ name: 'Jane Doe' })
      const user = await User.create(userData)
      const userObj = user.toObject()

      expect(userObj.displayName).toBe('Jane Doe')
    })
  })

  describe('Indexes', () => {
    it('should have index on role field', async () => {
      const indexes = User.schema.indexes()
      const roleIndex = indexes.find(index => index[0].role === 1)

      expect(roleIndex).toBeDefined()
    })

    it('should have index on isActive field', async () => {
      const indexes = User.schema.indexes()
      const isActiveIndex = indexes.find(index => index[0].isActive === 1)

      expect(isActiveIndex).toBeDefined()
    })

    it('should have index on createdAt field', async () => {
      const indexes = User.schema.indexes()
      const createdAtIndex = indexes.find(index => index[0].createdAt === -1)

      expect(createdAtIndex).toBeDefined()
    })

    it('should have compound index on role and isActive', async () => {
      const indexes = User.schema.indexes()
      const compoundIndex = indexes.find(
        index => index[0].role === 1 && index[0].isActive === 1
      )

      expect(compoundIndex).toBeDefined()
    })
  })

  describe('Timestamps', () => {
    it('should automatically set createdAt on creation', async () => {
      const userData = userFactory.build()
      const user = await User.create(userData)

      expect(user.createdAt).toBeDefined()
      expect(user.createdAt).toBeInstanceOf(Date)
    })

    it('should automatically set updatedAt on creation', async () => {
      const userData = userFactory.build()
      const user = await User.create(userData)

      expect(user.updatedAt).toBeDefined()
      expect(user.updatedAt).toBeInstanceOf(Date)
    })

    it('should update updatedAt on modification', async () => {
      const userData = userFactory.build()
      const user = await User.create(userData)
      const originalUpdatedAt = user.updatedAt

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10))

      user.name = 'Updated Name'
      await user.save()

      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
    })
  })

  describe('Virtual Population', () => {
    it('should have restaurants virtual field configured', () => {
      const virtuals = User.schema.virtuals
      expect(virtuals.restaurants).toBeDefined()
    })

    it('should configure restaurants virtual with correct ref', () => {
      const restaurantsVirtual = User.schema.virtuals.restaurants
      expect(restaurantsVirtual.options.ref).toBe('Restaurant')
      expect(restaurantsVirtual.options.localField).toBe('_id')
      expect(restaurantsVirtual.options.foreignField).toBe('userId')
    })
  })

  describe('Edge Cases', () => {
    it('should handle user creation with minimal required fields', async () => {
      const userData = {
        email: `minimal-${Date.now()}@example.com`,
        password: 'MinimalPass123!',
      }
      const user = await User.create(userData)

      expect(user._id).toBeDefined()
      expect(user.email).toBe(userData.email.toLowerCase())
      expect(user.role).toBe('user')
      expect(user.isActive).toBe(true)
    })

    it('should handle special characters in name', async () => {
      const userData = userFactory.build({ 
        name: "O'Brien-Smith" 
      })
      const user = await User.create(userData)

      expect(user.name).toBe("O'Brien-Smith")
    })

    it('should trim whitespace from name', async () => {
      const userData = userFactory.build({ 
        name: '  John Doe  ' 
      })
      const user = await User.create(userData)

      expect(user.name).toBe('John Doe')
    })
  })
})

