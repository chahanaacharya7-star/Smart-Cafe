const Cart = require('../models/cart.model');
const MenuItem = require('../models/menuItem.model');

const getCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id }).populate('items.menuItem');
  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }
  res.json({ success: true, data: cart });
};

const addToCart = async (req, res) => {
  const { menuItemId, quantity = 1 } = req.body;

  if (!menuItemId) {
    return res.status(400).json({ success: false, message: 'Please provide menuItemId' });
  }

  const menuItem = await MenuItem.findById(menuItemId);
  if (!menuItem) {
    return res.status(404).json({ success: false, message: 'Menu item not found' });
  }

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  const itemIndex = cart.items.findIndex(item => item.menuItem.toString() === menuItemId);

  let targetQuantity = quantity;
  if (itemIndex > -1) {
    targetQuantity += cart.items[itemIndex].quantity;
  }

  if (menuItem.stock < targetQuantity) {
    return res.status(400).json({ success: false, message: `Only ${menuItem.stock} items available in stock` });
  }

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = targetQuantity;
  } else {
    cart.items.push({ menuItem: menuItemId, quantity });
  }

  await cart.save();
  await cart.populate('items.menuItem');
  res.json({ success: true, data: cart });
};

const updateCartItem = async (req, res) => {
  const { menuItemId, quantity } = req.body;

  if (!menuItemId || quantity === undefined || quantity < 1) {
    return res.status(400).json({ success: false, message: 'Please provide a valid menuItemId and quantity (>= 1)' });
  }

  const menuItem = await MenuItem.findById(menuItemId);
  if (!menuItem) {
    return res.status(404).json({ success: false, message: 'Menu item not found' });
  }

  if (menuItem.stock < quantity) {
    return res.status(400).json({ success: false, message: `Only ${menuItem.stock} items available in stock` });
  }

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  const itemIndex = cart.items.findIndex(item => item.menuItem.toString() === menuItemId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate('items.menuItem');
    res.json({ success: true, data: cart });
  } else {
    res.status(404).json({ success: false, message: 'Item not found in cart' });
  }
};

const removeCartItem = async (req, res) => {
  const { menuItemId } = req.body;

  if (!menuItemId) {
    return res.status(400).json({ success: false, message: 'Please provide menuItemId' });
  }

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  cart.items = cart.items.filter(item => item.menuItem.toString() !== menuItemId);
  await cart.save();
  await cart.populate('items.menuItem');
  res.json({ success: true, data: cart });
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
};
