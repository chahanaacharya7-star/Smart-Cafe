const User = require("../models/User");
const { sendResponse } = require("../utils/helpers");

/**
 * Get all users with pagination and role filter
 * GET /api/users?page=1&limit=10&role=member
 * Admin only
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role } = req.query;

    // Build filter
    const filter = {};
    if (role) {
      filter.role = role;
    }

    // Parse and sanitize pagination parameters
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);

    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;
    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    // Fetch users
    const users = await User.find(filter)
      .select("-password") // Exclude password
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    sendResponse(res, 200, true, {
      users,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalUsers: total,
        limit: limitNum,
      },
    }, "Users retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 * Admin only
 */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return sendResponse(res, 404, false, null, "User not found");
    }

    sendResponse(res, 200, true, user, "User retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Update user by ID
 * PUT /api/users/:id
 * Admin only
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, membershipTier, phone, address, isActive } = req.body;

    let user = await User.findById(req.params.id);
    if (!user) {
      return sendResponse(res, 404, false, null, "User not found");
    }

    // Update allowed fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (membershipTier) user.membershipTier = membershipTier;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    sendResponse(res, 200, true, user, "User updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user by ID
 * DELETE /api/users/:id
 * Admin only
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return sendResponse(res, 404, false, null, "User not found");
    }

    sendResponse(res, 200, true, user, "User deleted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get user statistics
 * GET /api/users/stats/overview
 * Admin only
 */
exports.getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const memberCount = await User.countDocuments({ role: "member" });
    const adminCount = await User.countDocuments({ role: "admin" });
    const visitorCount = await User.countDocuments({ role: "visitor" });
    const premiumCount = await User.countDocuments({ membershipTier: "premium" });

    sendResponse(res, 200, true, {
      totalUsers,
      memberCount,
      adminCount,
      visitorCount,
      premiumCount,
    }, "User statistics retrieved successfully");
  } catch (error) {
    next(error);
  }
};
