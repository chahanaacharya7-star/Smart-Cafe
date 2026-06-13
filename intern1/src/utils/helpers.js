const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

/**
 * Standard API Response
 */
const sendResponse = (res, statusCode, success, data, message) => {
  res.status(statusCode).json({
    success,
    data,
    message,
  });
};

/**
 * Generate JWT Token (Access Token)
 */
const generateToken = async (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  return { accessToken, refreshToken };
};

/**
 * Upload to Cloudinary
 */
const uploadToCloudinary = async (filePath, folder = "smart-cafe") => {
  const cloudinary = require("../config/cloudinary");
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: "auto",
    });
    return result.secure_url;
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Delete file from temp folder
 */
const deleteFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    return false;
  }
};

module.exports = {
  sendResponse,
  generateToken,
  uploadToCloudinary,
  deleteFile,
};
