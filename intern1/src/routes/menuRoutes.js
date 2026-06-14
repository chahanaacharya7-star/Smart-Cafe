const express = require("express");
const router = express.Router();
const {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
} = require("../controllers/menuController");
const { validateMenuCreate, validateMenuUpdate, validate } = require("../middleware/validation");
const { verifyToken, isAdmin } = require("../middleware/auth");
const upload = require("../config/multer");

/**
 * @route GET /api/menu
 * @description Get all menu items
 * @access Public
 */
router.get("/", getAllMenuItems);

/**
 * @route GET /api/menu/:id
 * @description Get menu item by ID
 * @access Public
 */
router.get("/:id", getMenuItemById);

/**
 * @route POST /api/menu
 * @description Create menu item with image upload
 * @access Private/Admin
 */
router.post(
  "/",
  verifyToken,
  isAdmin,
  upload.single("image"),
  validateMenuCreate,
  validate,
  createMenuItem
);

/**
 * @route PUT /api/menu/:id
 * @description Update menu item with optional image upload
 * @access Private/Admin
 */
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  upload.single("image"),
  validateMenuUpdate,
  validate,
  updateMenuItem
);

/**
 * @route DELETE /api/menu/:id
 * @description Delete menu item
 * @access Private/Admin
 */
router.delete("/:id", verifyToken, isAdmin, deleteMenuItem);

/**
 * @route PATCH /api/menu/:id/toggle-availability
 * @description Toggle menu item availability
 * @access Private/Admin
 */
router.patch("/:id/toggle-availability", verifyToken, isAdmin, toggleAvailability);

module.exports = router;
