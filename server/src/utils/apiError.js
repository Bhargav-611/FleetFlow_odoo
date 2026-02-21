/**
 * Custom API Error Class
 * Standardized error handling across the application
 */

class ApiError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.timestamp = new Date().toISOString();

        // Capture stack trace
        Error.captureStackTrace(this, this.constructor);
    }

    // Convert to JSON response
    toJSON() {
        return {
            success: false,
            statusCode: this.statusCode,
            message: this.message,
            details: this.details,
            timestamp: this.timestamp,
        };
    }
}

/**
 * Predefined error factories
 */
const ApiErrorFactory = {
    // 400 Bad Request
    badRequest: (message = 'Bad request', details = null) =>
        new ApiError(400, message, details),

    // 401 Unauthorized
    unauthorized: (message = 'Unauthorized access') =>
        new ApiError(401, message),

    // 403 Forbidden
    forbidden: (message = 'Access forbidden') =>
        new ApiError(403, message),

    // 404 Not Found
    notFound: (resource = 'Resource') =>
        new ApiError(404, `${resource} not found`),

    // 409 Conflict
    conflict: (message = 'Resource conflict') =>
        new ApiError(409, message),

    // 422 Unprocessable Entity (Validation)
    validationError: (message = 'Validation failed', details = null) =>
        new ApiError(422, message, details),

    // 500 Internal Server Error
    internalServer: (message = 'Internal server error') =>
        new ApiError(500, message),

    // 503 Service Unavailable
    serviceUnavailable: (service = 'Service') =>
        new ApiError(503, `${service} is currently unavailable`),

    // External API Errors
    externalApiError: (service, statusCode, message) =>
        new ApiError(502, `${service} API error (${statusCode}): ${message}`),

    // Validation error with multiple fields
    multipleValidationErrors: (errors) => {
        const errorDetails = errors.reduce((acc, err) => {
            acc[err.field || err.param] = err.message;
            return acc;
        }, {});
        return new ApiError(422, 'Validation failed', errorDetails);
    },
};

module.exports = { ApiError, ApiErrorFactory };
