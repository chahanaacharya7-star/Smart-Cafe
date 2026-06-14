const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const MenuItem = require('../models/menuItem.model');
const { sendEmail } = require('../config/mailer');

const createOrder = async (req, res) => {
  const { paymentMethod, deliveryAddress } = req.body;

  if (!paymentMethod || !deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.phone) {
    return res.status(400).json({ success: false, message: 'Please provide paymentMethod and complete deliveryAddress' });
  }

  const cart = await Cart.findOne({ user: req.user.id }).populate('items.menuItem');
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: 'Your cart is empty' });
  }

  const orderItems = [];
  let totalAmount = 0;

  for (const item of cart.items) {
    const menuItem = item.menuItem;
    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item in cart not found' });
    }
    if (menuItem.stock < item.quantity) {
      return res.status(400).json({ success: false, message: `Not enough stock for ${menuItem.name}` });
    }
    orderItems.push({
      menuItem: menuItem._id,
      quantity: item.quantity,
      price: menuItem.price
    });
    totalAmount += menuItem.price * item.quantity;
  }

  for (const item of cart.items) {
    item.menuItem.stock -= item.quantity;
    await item.menuItem.save();
  }

  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    totalAmount,
    status: 'pending',
    paymentMethod,
    paymentStatus: 'Pending',
    deliveryAddress
  });

  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, data: order });
};

const getMyOrders = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const total = await Order.countDocuments({ user: req.user.id });
  const orders = await Order.find({ user: req.user.id })
    .populate('items.menuItem')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    data: orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
};

const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.menuItem');

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
  }

  res.json({ success: true, data: order });
};

const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  if (!status || !['pending', 'preparing', 'ready', 'delivered'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid status' });
  }

  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = status;
  await order.save();

  if (status === 'ready' || status === 'delivered') {
    try {
      await sendEmail({
        to: order.user.email,
        subject: `Your Smart-Cafe Order #${order._id} is ${status.toUpperCase()}!`,
        html: `
          <h1>Smart-Cafe Order Status Update</h1>
          <p>Hi ${order.user.name},</p>
          <p>Your order status has been updated to <strong>${status}</strong>.</p>
          <p>Order Total: $${order.totalAmount}</p>
          <p>Thank you for dining with us!</p>
        `
      });
    } catch (err) {
      console.error('Failed to send status update email:', err.message);
    }
  }

  res.json({ success: true, data: order });
};

const getAdminOrders = async (req, res) => {
  const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
  const query = {};

  if (status) {
    query.status = status;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('user', 'name email')
    .populate('items.menuItem')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    data: orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAdminOrders,
};
