const { body, validationResult } = require("express-validator");

// Validation middleware to check errors
const validate = (req, res, next) => {
  console.log("Running validation middleware");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Clean up uploaded file if it exists to avoid storage leaks
    if (req.file) {
      const fs = require("fs");
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (err) {
        console.error("Failed to delete temp file on validation failure:", err);
      }
    }

    return res.status(400).json({
      success: false,
      data: null,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Auth Validation Rules
const validateRegister = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),
];

const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

// Menu Validation Rules
const validateMenuCreate = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Menu item name is required"),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("description")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
  body("available")
    .optional()
    .isBoolean()
    .withMessage("Available must be a boolean"),
  body("isPremium")
    .optional()
    .isBoolean()
    .withMessage("isPremium must be a boolean"),
];

const validateMenuUpdate = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Menu item name cannot be empty"),
  body("category")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category cannot be empty"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
  body("available")
    .optional()
    .isBoolean()
    .withMessage("Available must be a boolean"),
  body("isPremium")
    .optional()
    .isBoolean()
    .withMessage("isPremium must be a boolean"),
];

module.exports = {
  validate,
  validateRegister,
  validateLogin,
  validateMenuCreate,
  validateMenuUpdate,
};
