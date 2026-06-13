const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
} = require("../controllers/userController");
const { verifyToken, isAdmin } = require("../middleware/auth");

/**
 * @route GET /api/users
 * @description Get all users with pagination and role filter
 * @query page, limit, role
 * @access Private/Admin
 */
router.get("/", verifyToken, isAdmin, getAllUsers);

/**
 * @route GET /api/users/stats/overview
 * @description Get user statistics
 * @access Private/Admin
 */
router.get("/stats/overview", verifyToken, isAdmin, getUserStats);

/**
 * @route GET /api/users/:id
 * @description Get user by ID
 * @access Private/Admin
 */
router.get("/:id", verifyToken, isAdmin, getUserById);

/**
 * @route PUT /api/users/:id
 * @description Update user by ID
 * @access Private/Admin
 */
router.put("/:id", verifyToken, isAdmin, updateUser);

/**
 * @route DELETE /api/users/:id
 * @description Delete user by ID
 * @access Private/Admin
 */
router.delete("/:id", verifyToken, isAdmin, deleteUser);

module.exports = router;
