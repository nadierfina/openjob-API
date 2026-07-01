const Joi = require('joi');

const CategorySchema = Joi.object({

  name: Joi.string().required(),
});

module.exports = CategorySchema;