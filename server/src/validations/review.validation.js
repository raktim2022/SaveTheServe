import Joi from 'joi';

// Create review validation
export const createReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required()
    .messages({
      'number.base': 'Rating must be a number',
      'number.integer': 'Rating must be an integer',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating must be at most 5',
      'any.required': 'Rating is required'
    }),
  comment: Joi.string().max(1000).optional().allow('', null)
    .messages({
      'string.base': 'Comment must be a string',
      'string.max': 'Comment must not exceed 1000 characters'
    }),
  restaurantId: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'Restaurant ID must be a number',
      'number.integer': 'Restaurant ID must be an integer',
      'number.positive': 'Restaurant ID must be a positive number'
    }),
  ngoId: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'NGO ID must be a number',
      'number.integer': 'NGO ID must be an integer',
      'number.positive': 'NGO ID must be a positive number'
    }),
  foodRequestId: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'Food request ID must be a number',
      'number.integer': 'Food request ID must be an integer',
      'number.positive': 'Food request ID must be a positive number'
    })
}).or('restaurantId', 'ngoId')
  .messages({
    'object.missing': 'Either restaurantId or ngoId must be provided'
  });

// Update review validation
export const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional()
    .messages({
      'number.base': 'Rating must be a number',
      'number.integer': 'Rating must be an integer',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating must be at most 5'
    }),
  comment: Joi.string().max(1000).optional().allow('', null)
    .messages({
      'string.base': 'Comment must be a string',
      'string.max': 'Comment must not exceed 1000 characters'
    })
});

// Review filter validation
export const reviewFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number().integer().min(1).max(50).default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must not exceed 50'
    }),
  restaurantId: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'Restaurant ID must be a number',
      'number.integer': 'Restaurant ID must be an integer',
      'number.positive': 'Restaurant ID must be a positive number'
    }),
  ngoId: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'NGO ID must be a number',
      'number.integer': 'NGO ID must be an integer',
      'number.positive': 'NGO ID must be a positive number'
    }),
  rating: Joi.number().integer().min(1).max(5).optional()
    .messages({
      'number.base': 'Rating must be a number',
      'number.integer': 'Rating must be an integer',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating must be at most 5'
    }),
  reviewerId: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'Reviewer ID must be a number',
      'number.integer': 'Reviewer ID must be an integer',
      'number.positive': 'Reviewer ID must be a positive number'
    })
});

// ID param validation
export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID must be a number',
      'number.integer': 'ID must be an integer',
      'number.positive': 'ID must be a positive number',
      'any.required': 'ID is required'
    })
});

// Pagination schema
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10)
});
