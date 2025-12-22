import Joi from 'joi';

export const authValidationSchemas = {
  // User registration validation
  register: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters',
        'any.required': 'Name is required',
      }),

    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),

    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required',
      }),

    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Confirm password must match password',
        'any.required': 'Confirm password is required',
      }),

    phone: Joi.string()
      .pattern(new RegExp('^[+]?[0-9]{10,15}$'))
      .allow('', null)
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number (10-15 digits)',
      }),

    role: Joi.string()
      .valid('ADMIN', 'NGO', 'RESTAURANT')
      .default('RESTAURANT')
      .messages({
        'any.only': 'Role must be either ADMIN, NGO, or RESTAURANT',
      }),

    // Organization details
    organizationName: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Organization name must be at least 2 characters long',
        'string.max': 'Organization name cannot exceed 100 characters',
      }),

    description: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 500 characters',
      }),

    // Location details
    address: Joi.string()
      .min(10)
      .max(200)
      .optional()
      .messages({
        'string.min': 'Address must be at least 10 characters long',
        'string.max': 'Address cannot exceed 200 characters',
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

    // NGO specific
    coverageRadiusKm: Joi.number()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'number.min': 'Coverage radius must be at least 1 km',
        'number.max': 'Coverage radius cannot exceed 100 km',
      }),

    // Restaurant specific
    shopType: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'Shop type cannot exceed 50 characters',
      }),
  }),

  // User login validation
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),

    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required',
      }),
  }),

  // Email verification
  verifyEmail: Joi.object({
    userId: Joi.alternatives()
      .try(
        Joi.string().required(),
        Joi.number().required()
      )
      .required()
      .messages({
        'any.required': 'User ID is required',
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    code: Joi.string()
      .length(6)
      .pattern(/^[0-9]+$/)
      .required()
      .messages({
        'string.length': 'Verification code must be 6 digits',
        'string.pattern.base': 'Verification code must contain only numbers',
        'any.required': 'Verification code is required',
      }),
  }),

  // Password reset request
  requestPasswordReset: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
  }),

  // Password reset
  resetPassword: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Reset token is required',
      }),

    newPassword: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'New password is required',
      }),

    confirmNewPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Confirm password must match new password',
        'any.required': 'Confirm password is required',
      }),
  }),

  // Refresh token
  refreshToken: Joi.object({
    refreshToken: Joi.string()
      .required()
      .messages({
        'any.required': 'Refresh token is required',
      }),
  }),

  // Change password
  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required',
      }),

    newPassword: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'New password is required',
      }),

    confirmNewPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Confirm password must match new password',
        'any.required': 'Confirm password is required',
      }),
  }),

  // Update profile
  updateProfile: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters',
      }),

    phone: Joi.string()
      .pattern(new RegExp('^[+]?[0-9]{10,15}$'))
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number (10-15 digits)',
      }),

    // Don't allow role changes through profile update
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update',
  }),
};

// Middleware function to validate request body using Joi
export const validateAuth = (schema) => {
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
