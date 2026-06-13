const User = require("../models/User");
const { sendResponse, generateToken } = require("../utils/helpers");
const { AppError } = require("../middleware/errorHandler");
const jwt = require("jsonwebtoken");

/**
 * Register a new user
 * POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role = "member" } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(res, 409, false, null, "Email already registered");
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    // Generate tokens
    const { accessToken, refreshToken } = await generateToken(user._id, user.role);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Return response
    sendResponse(res, 201, true, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    }, "User registered successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return sendResponse(res, 401, false, null, "Invalid email or password");
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendResponse(res, 401, false, null, "Invalid email or password");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateToken(user._id, user.role);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Return response
    sendResponse(res, 200, true, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    }, "Login successful");
  } catch (error) {
    next(error);
  }
};

/**
 * Get current logged-in user
 * GET /api/auth/me
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendResponse(res, 404, false, null, "User not found");
    }

    sendResponse(res, 200, true, user, "User retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
exports.logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(
      req.user.id,
      { $unset: { refreshToken: 1 } },
      { new: true }
    );

    sendResponse(res, 200, true, {}, "User logged out successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh-token
 */
exports.refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendResponse(res, 401, false, null, "Refresh token is required");
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Find user and check refresh token
    const user = await User.findById(decoded.userId).select("+refreshToken");
    if (!user || user.refreshToken !== refreshToken) {
      return sendResponse(res, 401, false, null, "Invalid or expired refresh token");
    }

    // Generate new tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateToken(
      user._id,
      user.role
    );

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    sendResponse(res, 200, true, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }, "Token refreshed successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 * PUT /api/auth/change-password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return sendResponse(res, 400, false, null, "Old and new passwords are required");
    }

    // Find user with password field
    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return sendResponse(res, 404, false, null, "User not found");
    }

    // Check old password
    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
      return sendResponse(res, 401, false, null, "Current password is incorrect");
    }

    // Update password
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    sendResponse(res, 200, true, {}, "Password changed successfully");
  } catch (error) {
    next(error);
  }
};
