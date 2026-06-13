const MenuItem = require("../models/MenuItem");
const { sendResponse, uploadToCloudinary } = require("../utils/helpers");
const fs = require("fs").promises;
const path = require("path");

/**
 * Get all menu items
 * GET /api/menu
 */
exports.getAllMenuItems = async (req, res, next) => {
  try {
    const items = await MenuItem.find().populate("createdBy", "name email");
    sendResponse(res, 200, true, items, "Menu items retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get single menu item
 * GET /api/menu/:id
 */
exports.getMenuItemById = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate("createdBy", "name email");
    if (!item) {
      return sendResponse(res, 404, false, null, "Menu item not found");
    }
    sendResponse(res, 200, true, item, "Menu item retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Create menu item with image upload
 * POST /api/menu
 */
exports.createMenuItem = async (req, res, next) => {
  try {
    console.log("Request body: ", req.body);
    const { name, category, price, description, available, isPremium,image } = req.body;
    let imageUrl = image; // Use provided image URL if exists

    // Upload image to Cloudinary if file exists
    if (req.file) {
      console.log("File received: ", req.file);
      imageUrl = await uploadToCloudinary(req.file.path, "smart-cafe/menu");
      // Delete temporary file
      await fs.unlink(req.file.path);
    }

    // Create menu item
    const menuItem = await MenuItem.create({
      name,
      category,
      price,
      description,
      image: imageUrl,
      available: available !== undefined ? available : true,
      isPremium: isPremium !== undefined ? isPremium : false,
      createdBy: req.user.id,
    });

    sendResponse(res, 201, true, menuItem, "Menu item created successfully");
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

/**
 * Update menu item with image upload
 * PUT /api/menu/:id
 */
exports.updateMenuItem = async (req, res, next) => {
  try {
    const { name, category, price, description, available, isPremium } = req.body;

    let menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      return sendResponse(res, 404, false, null, "Menu item not found");
    }

    // Handle image update
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.path, "smart-cafe/menu");
      menuItem.image = imageUrl;
      // Delete temporary file
      await fs.unlink(req.file.path);
    }

    // Update fields
    if (name) menuItem.name = name;
    if (category) menuItem.category = category;
    if (price !== undefined) menuItem.price = price;
    if (description) menuItem.description = description;
    if (available !== undefined) menuItem.available = available;
    if (isPremium !== undefined) menuItem.isPremium = isPremium;

    await menuItem.save();

    sendResponse(res, 200, true, menuItem, "Menu item updated successfully");
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

/**
 * Delete menu item
 * DELETE /api/menu/:id
 */
exports.deleteMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return sendResponse(res, 404, false, null, "Menu item not found");
    }

    sendResponse(res, 200, true, menuItem, "Menu item deleted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle menu item availability
 * PATCH /api/menu/:id/toggle-availability
 */
exports.toggleAvailability = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return sendResponse(res, 404, false, null, "Menu item not found");
    }

    menuItem.available = !menuItem.available;
    await menuItem.save();

    sendResponse(res, 200, true, menuItem, "Availability toggled successfully");
  } catch (error) {
    next(error);
  }
};
