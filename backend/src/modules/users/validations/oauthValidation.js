const Joi = require('joi')
const { OAUTH_PROVIDERS } = require('@common/constants/oauthConstants')

/**
 * Validation schema for unlinking OAuth provider
 */
const unlinkProviderSchema = Joi.object({
  provider: Joi.string()
    .valid(...Object.values(OAUTH_PROVIDERS))
    .required()
    .messages({
      'string.base': 'Provider must be a string',
      'any.only': `Provider must be one of: ${Object.values(OAUTH_PROVIDERS).join(', ')}`,
      'any.required': 'Provider is required',
    }),
})

module.exports = {
  unlinkProviderSchema,
}
