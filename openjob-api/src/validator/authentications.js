const Joi = require('joi');

const LoginSchema = Joi.object({

  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .required(),
});


const RefreshTokenSchema = Joi.object({

  refreshToken: Joi.string()
    .required(),
});

module.exports = {
  LoginSchema,
  RefreshTokenSchema,
};