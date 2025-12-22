import Joi from 'joi';

// Create food listing validation
export const createFoodListingSchema = Joi.object({
  foodName: Joi.string().min(2).max(100).required()
    .messages({
      'string.empty': 'Food name is required',
      'string.min': 'Food name must be at least 2 characters long',
      'string.max': 'Food name must not exceed 100 characters',
      'any.required': 'Food name is required'
    }),
  quantity: Joi.number().integer().min(1).required()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.integer': 'Quantity must be an integer',
      'number.min': 'Quantity must be at least 1',
      'any.required': 'Quantity is required'
    }),
  expiryTime: Joi.date().greater('now').required()
    .messages({
      'date.base': 'Expiry time must be a valid date',
      'date.greater': 'Expiry time must be in the future',
      'any.required': 'Expiry time is required'
    })
});

// Update food listing validation
export const updateFoodListingSchema = Joi.object({
  foodName: Joi.string().min(2).max(100).optional()
    .messages({
      'string.min': 'Food name must be at least 2 characters long',
      'string.max': 'Food name must not exceed 100 characters'
    }),
  quantity: Joi.number().integer().min(0).optional()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.integer': 'Quantity must be an integer',
      'number.min': 'Quantity must be at least 0'
    }),
  expiryTime: Joi.date().greater('now').optional()
    .messages({
      'date.base': 'Expiry time must be a valid date',
      'date.greater': 'Expiry time must be in the future'
    })
}).min(1);

// Food search validation
export const searchFoodSchema = Joi.object({
  query: Joi.string().min(1).max(100).required()
    .messages({
      'string.empty': 'Search query is required',
      'string.min': 'Search query must be at least 1 character long',
      'string.max': 'Search query must not exceed 100 characters',
      'any.required': 'Search query is required'
    }),
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
  isVegetarian: Joi.boolean().optional(),
  isVegan: Joi.boolean().optional(),
  isHalal: Joi.boolean().optional()
});

// Nearby food validation
export const nearbyFoodSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).optional()
    .messages({
      'number.base': 'Latitude must be a number',
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90'
    }),
  longitude: Joi.number().min(-180).max(180).optional()
    .messages({
      'number.base': 'Longitude must be a number',
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180'
    }),
  radius: Joi.number().min(0.1).max(50).default(5)
    .messages({
      'number.base': 'Radius must be a number',
      'number.min': 'Radius must be at least 0.1 km',
      'number.max': 'Radius must not exceed 50 km'
    }),
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
    })
});

// Food filter validation
export const foodFilterSchema = Joi.object({
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
  status: Joi.string().valid('AVAILABLE', 'REQUESTED', 'PICKED').optional()
    .messages({
      'any.only': 'Status must be one of AVAILABLE, REQUESTED, PICKED'
    }),
  foodType: Joi.string().min(2).max(50).optional()
    .messages({
      'string.min': 'Food type must be at least 2 characters long',
      'string.max': 'Food type must not exceed 50 characters'
    }),
  isVegetarian: Joi.boolean().optional(),
  isVegan: Joi.boolean().optional(),
  isHalal: Joi.boolean().optional()
});

// Category validation
export const categorySchema = Joi.object({
  category: Joi.string().min(2).max(50).required()
    .messages({
      'string.empty': 'Category is required',
      'string.min': 'Category must be at least 2 characters long',
      'string.max': 'Category must not exceed 50 characters',
      'any.required': 'Category is required'
    }),
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
    })
});

// Update quantity validation
export const updateQuantitySchema = Joi.object({
  quantity: Joi.number().integer().min(0).required()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.integer': 'Quantity must be an integer',
      'number.min': 'Quantity must be at least 0',
      'any.required': 'Quantity is required'
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