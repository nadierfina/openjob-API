const Joi = require('joi');

const CompanySchema = Joi.object({

  name: Joi.string().required(),

  description: Joi.string().required(),

  location: Joi.string().required(),
});

module.exports = CompanySchema;