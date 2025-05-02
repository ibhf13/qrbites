const User = require('@models/userModel')
const userMock = require('@mocks/userMock')

describe('User Model Test', () => {
  it('should create & save user successfully', async () => {
    const validUser = new User(userMock.validUser)
    const savedUser = await validUser.save()

    expect(savedUser._id).toBeDefined()
    expect(savedUser.email).toBe(userMock.validUser.email)
    expect(savedUser.password).not.toBe(userMock.validUser.password) // password should be hashed
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
  })

  it('should compare password correctly', async () => {
    const user = new User(userMock.validUser)
    await user.save()

    const isMatch = await user.comparePassword(userMock.validUser.password)
    expect(isMatch).toBe(true)

    const isNotMatch = await user.comparePassword('wrongpassword')
    expect(isNotMatch).toBe(false)
  })
}) 