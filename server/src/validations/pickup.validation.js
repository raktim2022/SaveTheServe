import Joi from 'joi';

// Initiate pickup validation
export const initiatePickupSchema = Joi.object({
  requestId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Request ID must be a number',
      'number.integer': 'Request ID must be an integer',
      'number.positive': 'Request ID must be a positive number',
      'any.required': 'Request ID is required'
    })
});

// QR code verification validation
export const verifyQRCodeSchema = Joi.object({
  qrCodeData: Joi.string().required()
    .messages({
      'string.empty': 'QR code data is required',
      'any.required': 'QR code data is required'
    })
});

// Complete pickup validation
export const completePickupSchema = Joi.object({
  completionNotes: Joi.string().max(500).optional()
    .messages({
      'string.max': 'Completion notes must not exceed 500 characters'
    })
});

// Cancel pickup validation
export const cancelPickupSchema = Joi.object({
  cancellationReason: Joi.string().min(10).max(500).required()
    .messages({
      'string.empty': 'Cancellation reason is required',
      'string.min': 'Cancellation reason must be at least 10 characters long',
      'string.max': 'Cancellation reason must not exceed 500 characters',
      'any.required': 'Cancellation reason is required'
    })
});

// Pickup filter validation
export const pickupFilterSchema = Joi.object({
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
  status: Joi.string().valid('INITIATED', 'VERIFIED', 'COMPLETED', 'CANCELLED').optional()
    .messages({
      'any.only': 'Status must be one of INITIATED, VERIFIED, COMPLETED, CANCELLED'
    }),
  startDate: Joi.date().optional()
    .messages({
      'date.base': 'Start date must be a valid date'
    }),
  endDate: Joi.date().min(Joi.ref('startDate')).optional()
    .messages({
      'date.base': 'End date must be a valid date',
      'date.min': 'End date must be after start date'
    })
});

// Update pickup status validation
export const updatePickupStatusSchema = Joi.object({
  status: Joi.string().valid('INITIATED', 'VERIFIED', 'COMPLETED', 'CANCELLED').required()
    .messages({
      'any.only': 'Status must be one of INITIATED, VERIFIED, COMPLETED, CANCELLED',
      'any.required': 'Status is required'
    }),
  notes: Joi.string().max(500).optional()
    .messages({
      'string.max': 'Notes must not exceed 500 characters'
    })
});

// Report generation validation
export const generateReportSchema = Joi.object({
  startDate: Joi.date().required()
    .messages({
      'date.base': 'Start date must be a valid date',
      'any.required': 'Start date is required'
    }),
  endDate: Joi.date().min(Joi.ref('startDate')).required()
    .messages({
      'date.base': 'End date must be a valid date',
      'date.min': 'End date must be after start date',
      'any.required': 'End date is required'
    }),
  status: Joi.string().valid('INITIATED', 'VERIFIED', 'COMPLETED', 'CANCELLED').optional()
    .messages({
      'any.only': 'Status must be one of INITIATED, VERIFIED, COMPLETED, CANCELLED'
    }),
  ngoId: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'NGO ID must be a number',
      'number.integer': 'NGO ID must be an integer',
      'number.positive': 'NGO ID must be a positive number'
    }),
  restaurantId: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'Restaurant ID must be a number',
      'number.integer': 'Restaurant ID must be an integer',
      'number.positive': 'Restaurant ID must be a positive number'
    })
});

// Integer parameter validation
export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID must be a number',
      'number.integer': 'ID must be an integer', 
      'number.positive': 'ID must be a positive number',
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