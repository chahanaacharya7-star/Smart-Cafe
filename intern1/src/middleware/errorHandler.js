/**
 * Global Error Handling Middleware
 * Standardizes all API error responses with format: { success, data, message }
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  // Response format
  const response = {
    success: false,
    data: null,
    message: err.message,
  };

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    response.message = "Validation Error";
    response.errors = errors;
    return res.status(400).json(response);
  }

  // Mongoose CastError (Invalid ID)
  if (err.name === "CastError") {
    response.message = "Invalid ID format";
    return res.status(400).json(response);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    response.message = `${field} already exists`;
    return res.status(400).json(response);
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    response.message = "Invalid token";
    return res.status(401).json(response);
  }

  if (err.name === "TokenExpiredError") {
    response.message = "Token expired";
    return res.status(401).json(response);
  }

  // Multer errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      response.message = "File size exceeds 5MB limit";
      return res.status(400).json(response);
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      response.message = "Too many files";
      return res.status(400).json(response);
    }
  }

  // Default error response
  console.error("Error:", err);
  res.status(err.statusCode).json(response);
};

module.exports = { errorHandler, AppError };
