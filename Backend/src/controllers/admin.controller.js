const User = require('../models/user.model');

const updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!role || !['customer', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid role (customer or admin)' });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.role = role;
  await user.save();

  res.json({
    success: true,
    message: `User role updated to ${role}`,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

module.exports = {
  updateUserRole,
};
