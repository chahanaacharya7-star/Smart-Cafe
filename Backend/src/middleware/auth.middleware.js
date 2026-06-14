const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const verifyToken = async (req, res, next) => {
  // --- TEMPORARY BYPASS FOR EASY POSTMAN TESTING ---
  // Automatically sets you as the Admin so you don't need to pass tokens!
  try {
    const defaultAdmin = await User.findOne({ email: 'admin@cafe.com' });
    if (defaultAdmin) {
      req.user = defaultAdmin;
      return next();
    }
  } catch(e) {}
  // ------------------------------------------------

  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.body && req.body.token) {
    token = req.body.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey');

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};

module.exports = { verifyToken, isAdmin };
