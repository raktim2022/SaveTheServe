import Joi from 'joi';

// Restaurant registration validation
export const registerRestaurantSchema = Joi.object({
  userId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number',
      'any.required': 'User ID is required'
    }),
  name: Joi.string().min(2).max(100).required()
    .messages({
      'string.empty': 'Restaurant name is required',
      'string.min': 'Restaurant name must be at least 2 characters long',
      'string.max': 'Restaurant name must not exceed 100 characters',
      'any.required': 'Restaurant name is required'
    }),
  description: Joi.string().max(500).optional()
    .messages({
      'string.max': 'Description must not exceed 500 characters'
    }),
  cuisine: Joi.string().min(2).max(100).required()
    .messages({
      'string.empty': 'Cuisine type is required',
      'string.min': 'Cuisine type must be at least 2 characters long',
      'string.max': 'Cuisine type must not exceed 100 characters',
      'any.required': 'Cuisine type is required'
    }),
  address: Joi.string().min(10).max(200).required()
    .messages({
      'string.empty': 'Address is required',
      'string.min': 'Address must be at least 10 characters long',
      'string.max': 'Address must not exceed 200 characters',
      'any.required': 'Address is required'
    }),
  latitude: Joi.number().min(-90).max(90).required()
    .messages({
      'number.base': 'Latitude must be a number',
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90',
      'any.required': 'Latitude is required'
    }),
  longitude: Joi.number().min(-180).max(180).required()
    .messages({
      'number.base': 'Longitude must be a number',
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180',
      'any.required': 'Longitude is required'
    }),
  phone: Joi.string().pattern(/^[+]?[1-9]\d{1,14}$/).required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Phone number must be valid',
      'any.required': 'Phone number is required'
    }),
  licenseNumber: Joi.string().min(3).max(50).required()
    .messages({
      'string.empty': 'License number is required',
      'string.min': 'License number must be at least 3 characters long',
      'string.max': 'License number must not exceed 50 characters',
      'any.required': 'License number is required'
    }),
  operatingHours: Joi.object().pattern(
    Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
    Joi.object({
      open: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
      close: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
      isClosed: Joi.boolean().default(false)
    })
  ).optional()
    .messages({
      'object.base': 'Operating hours must be an object'
    })
});

// Restaurant update validation
export const updateRestaurantSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional()
    .messages({
      'string.min': 'Restaurant name must be at least 2 characters long',
      'string.max': 'Restaurant name must not exceed 100 characters'
    }),
  description: Joi.string().max(500).optional()
    .messages({
      'string.max': 'Description must not exceed 500 characters'
    }),
  cuisine: Joi.string().min(2).max(100).optional()
    .messages({
      'string.min': 'Cuisine type must be at least 2 characters long',
      'string.max': 'Cuisine type must not exceed 100 characters'
    }),
  address: Joi.string().min(10).max(200).optional()
    .messages({
      'string.min': 'Address must be at least 10 characters long',
      'string.max': 'Address must not exceed 200 characters'
    }),
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
  phone: Joi.string().pattern(/^[+]?[1-9]\d{1,14}$/).optional()
    .messages({
      'string.pattern.base': 'Phone number must be valid'
    }),
  licenseNumber: Joi.string().min(3).max(50).optional()
    .messages({
      'string.min': 'License number must be at least 3 characters long',
      'string.max': 'License number must not exceed 50 characters'
    })
}).min(1);

// Restaurant search validation
export const searchRestaurantSchema = Joi.object({
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
    })
});

// Nearby restaurants validation
export const nearbyRestaurantsSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required()
    .messages({
      'number.base': 'Latitude must be a number',
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90',
      'any.required': 'Latitude is required'
    }),
  longitude: Joi.number().min(-180).max(180).required()
    .messages({
      'number.base': 'Longitude must be a number',
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180',
      'any.required': 'Longitude is required'
    }),
  radius: Joi.number().min(0.1).max(50).default(5)
    .messages({
      'number.base': 'Radius must be a number',
      'number.min': 'Radius must be at least 0.1 km',
      'number.max': 'Radius must not exceed 50 km'
    })
});

// Operating hours update validation
export const operatingHoursSchema = Joi.object({
  operatingHours: Joi.object().pattern(
    Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
    Joi.object({
      open: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required()
        .messages({
          'string.pattern.base': 'Open time must be in HH:MM format'
        }),
      close: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required()
        .messages({
          'string.pattern.base': 'Close time must be in HH:MM format'
        }),
      isClosed: Joi.boolean().default(false)
    })
  ).required()
    .messages({
      'object.base': 'Operating hours must be an object',
      'any.required': 'Operating hours are required'
    })
});

// Contact information update validation
export const contactInfoSchema = Joi.object({
  phone: Joi.string().pattern(/^[+]?[1-9]\d{1,14}$/).optional()
    .messages({
      'string.pattern.base': 'Phone number must be valid'
    }),
  email: Joi.string().email().optional()
    .messages({
      'string.email': 'Email must be valid'
    }),
  address: Joi.string().min(10).max(200).optional()
    .messages({
      'string.min': 'Address must be at least 10 characters long',
      'string.max': 'Address must not exceed 200 characters'
    }),
  latitude: Joi.number().min(-90).max(90).when('address', {
    is: Joi.exist(),
    then: Joi.required(),
    otherwise: Joi.optional()
  }).messages({
    'number.base': 'Latitude must be a number',
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90',
    'any.required': 'Latitude is required when address is provided'
  }),
  longitude: Joi.number().min(-180).max(180).when('address', {
    is: Joi.exist(),
    then: Joi.required(),
    otherwise: Joi.optional()
  }).messages({
    'number.base': 'Longitude must be a number',
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180',
    'any.required': 'Longitude is required when address is provided'
  })
}).min(1);

// Food listings filter validation
export const foodListingsFilterSchema = Joi.object({
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
    }),
  search: Joi.string().allow('').optional()
    .messages({
      'string.base': 'Search must be a string'
    })
});

// UUID parameter validation
export const uuidParamSchema = Joi.object({
  id: Joi.string().uuid().required()
    .messages({
      'string.empty': 'ID is required',
      'string.guid': 'ID must be a valid UUID',
      'any.required': 'ID is required'
    })
});