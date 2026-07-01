const Joi = require('joi');

const JobSchema = Joi.object({

  company_id: Joi.string().required(),

  category_id: Joi.string().required(),

  title: Joi.string().required(),

  description: Joi.string().required(),

  job_type: Joi.string().required(),

  experience_level: Joi.string().required(),

  location_type: Joi.string().required(),

  status: Joi.string().required(),

  location_city: Joi.string(),

  salary_min: Joi.number(),

  salary_max: Joi.number(),

  is_salary_visible: Joi.boolean(),
});

module.exports = JobSchema;