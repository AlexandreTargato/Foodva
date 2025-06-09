import Joi from 'joi';

export const createPostSchema = Joi.object({
  image_url: Joi.string().uri().required(),
  caption: Joi.string().max(2000).optional(),
  location: Joi.string().max(100).optional()
});

export const createCommentSchema = Joi.object({
  post_id: Joi.string().uuid().required(),
  content: Joi.string().min(1).max(1000).required()
});

export const updateProfileSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).optional(),
  full_name: Joi.string().max(100).optional(),
  bio: Joi.string().max(500).optional(),
  avatar_url: Joi.string().uri().optional()
});

export const likePostSchema = Joi.object({
  post_id: Joi.string().uuid().required()
});

export const paginationSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).optional(),
  offset: Joi.number().integer().min(0).optional()
});

export const validateRequest = (schema: Joi.ObjectSchema, data: any) => {
  const { error, value } = schema.validate(data);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }
  return value;
};

export default {
  createPostSchema,
  createCommentSchema,
  updateProfileSchema,
  likePostSchema,
  paginationSchema,
  validateRequest
};