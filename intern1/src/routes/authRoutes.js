const express = require("express");
const router = express.Router();
const { register, login, getMe, logout, refreshAccessToken, changePassword } = require("../controllers/authController");
const { validateRegister, validateLogin, validate } = require("../middleware/validation");
const { verifyToken } = require("../middleware/auth");

/**
 * @route POST /api/auth/register
 * @description Register a new user
 */
router.post("/register", validateRegister, validate, register);

/**
 * @route POST /api/auth/login
 * @description Login user
 */
router.post("/login", validateLogin, validate, login);

/**
 * @route GET /api/auth/me
 * @description Get current logged-in user
 * @access Private
 */
router.get("/me", verifyToken, getMe);

/**
 * @route POST /api/auth/logout
 * @description Logout user
 * @access Private
 */
router.post("/logout", verifyToken, logout);

/**
 * @route POST /api/auth/refresh-token
 * @description Refresh access token using refresh token
 */
router.post("/refresh-token", refreshAccessToken);

/**
 * @route PUT /api/auth/change-password
 * @description Change user password
 * @access Private
 */
router.put("/change-password", verifyToken, changePassword);

module.exports = router;
