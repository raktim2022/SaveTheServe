import Joi from 'joi';

// Create food request validation
export const createFoodRequestSchema = Joi.object({
  foodListingId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Food listing ID must be a number',
      'number.integer': 'Food listing ID must be an integer',
      'number.positive': 'Food listing ID must be a positive number',
      'any.required': 'Food listing ID is required'
    }),
  pickupTime: Joi.date().greater('now').optional()
    .messages({
      'date.base': 'Pickup time must be a valid date',
      'date.greater': 'Pickup time must be in the future'
    })
});

// Request filter validation
export const requestFilterSchema = Joi.object({
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
  status: Joi.string().valid('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED').optional()
    .messages({
      'any.only': 'Status must be one of PENDING, ACCEPTED, REJECTED, COMPLETED'
    }),
  foodType: Joi.string().min(2).max(50).optional()
    .messages({
      'string.min': 'Food type must be at least 2 characters long',
      'string.max': 'Food type must not exceed 50 characters'
    })
});

// Reject request validation
export const rejectRequestSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required()
    .messages({
      'string.empty': 'Rejection reason is required',
      'string.min': 'Reason must be at least 10 characters long',
      'string.max': 'Reason must not exceed 500 characters',
      'any.required': 'Rejection reason is required'
    })
});

// Update request status validation
export const updateStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED').required()
    .messages({
      'any.only': 'Status must be one of PENDING, ACCEPTED, REJECTED, COMPLETED',
      'any.required': 'Status is required'
    }),
  reason: Joi.string().min(10).max(500).optional()
  .messages({
    'string.min': 'Reason must be at least 10 characters long',
    'string.max': 'Reason must not exceed 500 characters'
  })
});

// Integer parameter validation
export const idParamSchema = Joi.object({
  id: Joi.string().pattern(/^\d+$/).required()
    .messages({
      'string.pattern.base': 'ID must be a valid number',
      'string.empty': 'ID is required',
      'any.required': 'ID is required'
    })
});

// Pagination validation
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number().integer().min(1).max(100).default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must not exceed 100'
    })
});