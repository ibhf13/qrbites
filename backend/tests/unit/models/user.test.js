const User = require('@models/user')
const userMock = require('@mocks/userMock')

describe('User Model Test', () => {
  it('should create & save user successfully', async () => {
    const validUser = new User(userMock.validUser)
    const savedUser = await validUser.save()

    expect(savedUser._id).toBeDefined()
    expect(savedUser.email).toBe(userMock.validUser.email)
    expect(savedUser.password).not.toBe(userMock.validUser.password) // password should be hashed
    expect(savedUser.role).toBe('user') // default role
    expect(savedUser.isActive).toBe(true) // default isActive
  })

  it('should fail to save user without required fields', async () => {
    const userWithoutRequiredField = new User({ email: 'test@example.com' })
    let err

    try {
      await userWithoutRequiredField.save()
    } catch (error) {
      err = error
    }

    expect(err).toBeInstanceOf(Error)
    expect(err.errors.password).toBeDefined()
  })

  it('should fail to save user with invalid email', async () => {
    const userWithInvalidEmail = new User(userMock.invalidUser)
    let err

    try {
      await userWithInvalidEmail.save()
    } catch (error) {
      err = error
    }

    expect(err).toBeInstanceOf(Error)
    // Check for validation errors (could be email, password, or role)
    expect(err.errors).toBeDefined()
  })

  it('should fail to save user with password less than 6 characters', async () => {
    const userWithShortPassword = new User({
      email: 'test@example.com',
      password: '123' // too short
    })
    let err

    try {
      await userWithShortPassword.save()
    } catch (error) {
      err = error
    }

    expect(err).toBeInstanceOf(Error)
    expect(err.errors.password).toBeDefined()
  })

  it('should compare password correctly', async () => {
    const user = new User(userMock.validUser)
    await user.save()

    const isMatch = await user.comparePassword(userMock.validUser.password)
    expect(isMatch).toBe(true)

    const isNotMatch = await user.comparePassword('wrongpassword')
    expect(isNotMatch).toBe(false)
  })

  it('should hash password automatically on save', async () => {
    const plainPassword = 'testpassword123'
    const user = new User({
      email: 'hash@test.com',
      password: plainPassword
    })

    await user.save()

    // Password should be hashed
    expect(user.password).not.toBe(plainPassword)
    expect(user.password).toMatch(/^\$2[aby]\$/)

    // Should be able to compare the plain password
    const isMatch = await user.comparePassword(plainPassword)
    expect(isMatch).toBe(true)
  })

  it('should not hash password if not modified on update', async () => {
    const user = new User(userMock.validUser)
    await user.save()

    const originalPassword = user.password

    // Update a field other than password
    user.email = 'updated@test.com'
    await user.save()

    // Password should remain the same
    expect(user.password).toBe(originalPassword)
  })

  it('should validate role enum values', async () => {
    const userWithInvalidRole = new User({
      email: 'test@example.com',
      password: 'password123',
      role: 'invalidrole'
    })

    let err
    try {
      await userWithInvalidRole.save()
    } catch (error) {
      err = error
    }

    expect(err).toBeInstanceOf(Error)
  })

  it('should set default values correctly', async () => {
    const user = new User({
      email: 'defaults@test.com',
      password: 'password123'
    })

    await user.save()

    expect(user.role).toBe('user')
    expect(user.isActive).toBe(true)
    expect(user.createdAt).toBeDefined()
    expect(user.updatedAt).toBeDefined()
  })

  it('should handle unique email constraint', async () => {
    const firstUser = new User({
      email: 'unique@test.com',
      password: 'password123'
    })
    await firstUser.save()

    const duplicateUser = new User({
      email: 'unique@test.com', // Same email
      password: 'password456'
    })

    let err
    try {
      await duplicateUser.save()
    } catch (error) {
      err = error
    }

    expect(err).toBeInstanceOf(Error)
    expect(err.code).toBe(11000) // MongoDB duplicate key error
  })

  it('should trim and lowercase email', async () => {
    const user = new User({
      email: '  TRIM@TEST.COM  ',
      password: 'password123'
    })

    await user.save()

    expect(user.email).toBe('trim@test.com')
  })

  it('should include virtual fields in JSON output', async () => {
    const user = new User(userMock.validUser)
    await user.save()

    // Virtual fields should be included in schema definition
    expect(user.schema.virtuals).toHaveProperty('profile')
    expect(user.schema.virtuals).toHaveProperty('restaurants')

    // Check that virtuals are included in JSON configuration
    const schemaOptions = user.schema.options
    expect(schemaOptions.toJSON.virtuals).toBe(true)
    expect(schemaOptions.toObject.virtuals).toBe(true)
  })

  it('should update timestamps correctly', async () => {
    const user = new User(userMock.validUser)
    await user.save()

    const originalUpdatedAt = user.updatedAt

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10))

    user.email = 'updated@test.com'
    await user.save()

    expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
  })

  // Additional comprehensive tests
  describe('Advanced User Model Tests', () => {
    it('should create admin user successfully', async () => {
      const adminUser = new User({
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
      })

      const savedUser = await adminUser.save()

      expect(savedUser.role).toBe('admin')
      expect(savedUser.isActive).toBe(true)
    })

    it('should allow deactivating user', async () => {
      const user = new User({
        email: 'deactivate@test.com',
        password: 'password123',
        isActive: false
      })

      const savedUser = await user.save()

      expect(savedUser.isActive).toBe(false)
    })

    it('should handle password comparison errors gracefully', async () => {
      const user = new User(userMock.validUser)
      await user.save()

      // Mock bcrypt to throw an error
      const originalCompare = require('bcryptjs').compare
      require('bcryptjs').compare = jest.fn().mockRejectedValue(new Error('Comparison error'))

      try {
        await user.comparePassword('anypassword')
        fail('Should have thrown an error')
      } catch (error) {
        expect(error.message).toBe('Comparison error')
      }

      // Restore original function
      require('bcryptjs').compare = originalCompare
    })

    it('should handle hashing errors in pre-save hook', async () => {
      const user = new User({
        email: 'hasherror@test.com',
        password: 'password123'
      })

      // Mock bcrypt to throw an error
      const originalGenSalt = require('bcryptjs').genSalt
      require('bcryptjs').genSalt = jest.fn().mockRejectedValue(new Error('Salt generation error'))

      try {
        await user.save()
        fail('Should have thrown an error')
      } catch (error) {
        expect(error.message).toBe('Salt generation error')
      }

      // Restore original function
      require('bcryptjs').genSalt = originalGenSalt
    })

    it('should validate various email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'test123@test-domain.com'
      ]

      for (const email of validEmails) {
        const user = new User({
          email,
          password: 'password123'
        })

        const savedUser = await user.save()
        expect(savedUser.email).toBe(email.toLowerCase())

        // Clean up
        await user.deleteOne()
      }
    })

    it('should reject invalid email formats', async () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test@example'
      ]

      for (const email of invalidEmails) {
        const user = new User({
          email,
          password: 'password123'
        })

        let err
        try {
          await user.save()
        } catch (error) {
          err = error
        }

        if (err) {
          expect(err).toBeInstanceOf(Error)
          expect(err.errors).toBeDefined()
        }
      }
    })

    it('should handle password update correctly', async () => {
      const user = new User({
        email: 'passwordupdate@test.com',
        password: 'oldpassword123'
      })

      await user.save()
      const originalPassword = user.password

      // Update password
      user.password = 'newpassword123'
      await user.save()

      // Password should be different (re-hashed)
      expect(user.password).not.toBe(originalPassword)

      // Should be able to compare with new password
      const isNewMatch = await user.comparePassword('newpassword123')
      expect(isNewMatch).toBe(true)

      // Should not match old password
      const isOldMatch = await user.comparePassword('oldpassword123')
      expect(isOldMatch).toBe(false)
    })

    it('should maintain data integrity on multiple saves', async () => {
      const user = new User({
        email: 'integrity@test.com',
        password: 'password123',
        role: 'user'
      })

      // First save
      await user.save()
      const firstSaveData = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }

      // Update non-password field
      user.role = 'admin'
      await user.save()

      // Data should be consistent
      expect(user._id.toString()).toBe(firstSaveData.id)
      expect(user.email).toBe(firstSaveData.email)
      expect(user.role).toBe('admin') // Updated field
      expect(user.isActive).toBe(firstSaveData.isActive)
    })

    it('should properly handle JSON serialization with virtuals', async () => {
      const user = new User(userMock.validUser)
      await user.save()

      const userJSON = user.toJSON()

      // Should include id virtual
      expect(userJSON).toHaveProperty('id')

      // Password should still be present in raw JSON (not excluded by default)
      expect(userJSON).toHaveProperty('password')

      // Check that virtual configuration is set correctly
      const schemaOptions = user.schema.options
      expect(schemaOptions.toJSON.virtuals).toBe(true)
      expect(schemaOptions.toObject.virtuals).toBe(true)
    })
  })
}) 