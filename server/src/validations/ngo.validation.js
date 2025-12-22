import Joi from 'joi';

export const ngoValidationSchemas = {
  // NGO registration validation
  registerNGO: Joi.object({
    ngoName: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'NGO name must be at least 2 characters long',
        'string.max': 'NGO name cannot exceed 100 characters',
        'any.required': 'NGO name is required',
      }),

    address: Joi.string()
      .min(10)
      .max(255)
      .required()
      .messages({
        'string.min': 'Address must be at least 10 characters long',
        'string.max': 'Address cannot exceed 255 characters',
        'any.required': 'Address is required',
      }),

    latitude: Joi.number()
      .min(-90)
      .max(90)
      .required()
      .messages({
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90',
        'any.required': 'Latitude is required',
      }),

    longitude: Joi.number()
      .min(-180)
      .max(180)
      .required()
      .messages({
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180',
        'any.required': 'Longitude is required',
      }),

    coverageRadiusKm: Joi.number()
      .min(1)
      .max(50)
      .required()
      .messages({
        'number.min': 'Coverage radius must be at least 1 km',
        'number.max': 'Coverage radius cannot exceed 50 km',
        'any.required': 'Coverage radius is required',
      }),
  }),

  // NGO update validation (all fields optional)
  updateNGO: Joi.object({
    ngoName: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .messages({
        'string.min': 'NGO name must be at least 2 characters long',
        'string.max': 'NGO name cannot exceed 100 characters',
      }),

    address: Joi.string()
      .min(10)
      .max(255)
      .optional()
      .messages({
        'string.min': 'Address must be at least 10 characters long',
        'string.max': 'Address cannot exceed 255 characters',
      }),

    latitude: Joi.number()
      .min(-90)
      .max(90)
      .optional()
      .messages({
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90',
      }),

    longitude: Joi.number()
      .min(-180)
      .max(180)
      .optional()
      .messages({
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180',
      }),

    coverageRadiusKm: Joi.number()
      .min(1)
      .max(50)
      .optional()
      .messages({
        'number.min': 'Coverage radius must be at least 1 km',
        'number.max': 'Coverage radius cannot exceed 50 km',
      }),
  }),

  // Food request creation validation
  createFoodRequest: Joi.object({
    foodListingId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.positive': 'Food listing ID must be a positive number',
        'any.required': 'Food listing ID is required',
      }),
  }),

  // Coordinate validation for location-based queries
  coordinates: Joi.object({
    latitude: Joi.number()
      .min(-90)
      .max(90)
      .required()
      .messages({
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90',
        'any.required': 'Latitude is required',
      }),

    longitude: Joi.number()
      .min(-180)
      .max(180)
      .required()
      .messages({
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180',
        'any.required': 'Longitude is required',
      }),

    radius: Joi.number()
      .min(1)
      .max(100)
      .optional()
      .default(10)
      .messages({
        'number.min': 'Radius must be at least 1 km',
        'number.max': 'Radius cannot exceed 100 km',
      }),
  }),
};

// Middleware function to validate request body using Joi
export const validateNGO = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

// Middleware function to validate query parameters
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      return res.status(400).json({
        success: false,
        message: 'Query validation failed',
        errors,
      });
    }

    // Replace req.query with validated data
    req.query = { ...req.query, ...value };
    next();
  };
};