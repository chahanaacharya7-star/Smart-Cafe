const jwt = require("jsonwebtoken");
const { AppError } = require("./errorHandler");

/**
 * Middleware to verify JWT token
 */
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      data: null,
      message: "No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.userId || decoded.id,
      ...decoded
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

/**
 * Middleware to check if user is admin
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      data: null,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      data: null,
      message: "Admin access required",
    });
  }

  next();
};

/**
 * Middleware to check if user is authenticated (Member or Admin)
 */
const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      data: null,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "member" && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      data: null,
      message: "Access denied",
    });
  }

  next();
};

module.exports = { verifyToken, isAdmin, isAuthenticated };
