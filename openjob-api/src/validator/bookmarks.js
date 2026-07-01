const Joi = require('joi');

const BookmarkSchema = Joi.object({

  user_id: Joi.string().required(),

  job_id: Joi.string().required(),
});

module.exports = BookmarkSchema;