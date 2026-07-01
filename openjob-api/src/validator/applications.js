const Joi = require('joi');

const ApplicationSchema = Joi.object({

  user_id: Joi.string().required(),

  job_id: Joi.string().required(),

  status: Joi.string().required(),
});

module.exports = ApplicationSchema;