/**
 * Standardized response helper for API endpoints
 */
export class ResponseHelper {
  /**
   * Send success response
   */
  success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send error response
   */
  error(res, message = 'Internal server error', statusCode = 500, error = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      error,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send validation error response
   */
  validationError(res, message = 'Validation failed', errors = null) {
    return res.status(400).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send not found response
   */
  notFound(res, message = 'Resource not found') {
    return res.status(404).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send unauthorized response
   */
  unauthorized(res, message = 'Unauthorized access') {
    return res.status(401).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send forbidden response
   */
  forbidden(res, message = 'Access forbidden') {
    return res.status(403).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send conflict response
   */
  conflict(res, message = 'Conflict') {
    return res.status(409).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send too many requests response
   */
  tooManyRequests(res, message = 'Too many requests') {
    return res.status(429).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send created response
   */
  created(res, data = null, message = 'Created successfully') {
    return res.status(201).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send no content response
   */
  noContent(res) {
    return res.status(204).send();
  }
}

// Create and export instance
export const responseHelper = new ResponseHelper();