const Order = require('../models/order.model');

const verifyEsewa = async (req, res) => {
  const { orderId, status } = req.body;

  if (!orderId || !status) {
    return res.status(400).json({ success: false, message: 'Please provide orderId and status' });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (status === 'success') {
    order.paymentStatus = 'Paid';
  } else {
    order.paymentStatus = 'Failed';
  }

  await order.save();
  res.json({ success: true, message: `Payment verified. Status: ${order.paymentStatus}`, data: order });
};

const verifyKhalti = async (req, res) => {
  const { orderId, status } = req.body;

  if (!orderId || !status) {
    return res.status(400).json({ success: false, message: 'Please provide orderId and status' });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (status === 'success') {
    order.paymentStatus = 'Paid';
  } else {
    order.paymentStatus = 'Failed';
  }

  await order.save();
  res.json({ success: true, message: `Payment verified. Status: ${order.paymentStatus}`, data: order });
};

module.exports = {
  verifyEsewa,
  verifyKhalti,
};
