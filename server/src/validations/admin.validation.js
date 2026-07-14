import Joi from 'joi';

// Admin creation validation
export const createAdminSchema = Joi.object({
  userId: Joi.string().uuid().required()
    .messages({
      'string.empty': 'User ID is required',
      'string.guid': 'User ID must be a valid UUID',
      'any.required': 'User ID is required'
    }),
  department: Joi.string().min(2).max(100).optional()
    .messages({
      'string.min': 'Department must be at least 2 characters long',
      'string.max': 'Department must not exceed 100 characters'
    }),
  permissions: Joi.array().items(Joi.string()).optional()
    .messages({
      'array.base': 'Permissions must be an array'
    })
});

// Admin update validation
export const updateAdminSchema = Joi.object({
  department: Joi.string().min(2).max(100).optional()
    .messages({
      'string.min': 'Department must be at least 2 characters long',
      'string.max': 'Department must not exceed 100 characters'
    }),
  permissions: Joi.array().items(Joi.string()).optional()
    .messages({
      'array.base': 'Permissions must be an array'
    })
}).min(1);

// User filtering validation
export const userFilterSchema = Joi.object({
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
    }),
  role: Joi.string().valid('NGO', 'RESTAURANT', 'ADMIN').optional()
    .messages({
      'any.only': 'Role must be one of NGO, RESTAURANT, or ADMIN'
    }),
  isVerified: Joi.boolean().optional()
    .messages({
      'boolean.base': 'isVerified must be a boolean'
    }),
  isActive: Joi.boolean().optional()
    .messages({
      'boolean.base': 'isActive must be a boolean'
    })
});

// Approval/Rejection validation
export const approvalDecisionSchema = Joi.object({
  reason: Joi.string().min(10).max(500).when('action', {
    is: 'reject',
    then: Joi.required(),
    otherwise: Joi.optional()
  }).messages({
    'string.min': 'Reason must be at least 10 characters long',
    'string.max': 'Reason must not exceed 500 characters',
    'any.required': 'Reason is required for rejection'
  })
});

// User suspension validation
export const suspendUserSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required()
    .messages({
      'string.empty': 'Suspension reason is required',
      'string.min': 'Reason must be at least 10 characters long',
      'string.max': 'Reason must not exceed 500 characters',
      'any.required': 'Suspension reason is required'
    })
});

// Password change validation
export const changePasswordSchema = Joi.object({
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must not exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required'
    })
});

// ID parameter validation
export const idParamSchema = Joi.object({
  id: Joi.number().integer().required()
    .messages({
      'number.base': 'ID must be a number',
      'number.integer': 'ID must be an integer',
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
    }),
  search: Joi.string().allow('').optional()
    .messages({
      'string.base': 'Search must be a string'
    })
});