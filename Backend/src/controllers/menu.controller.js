const MenuItem = require('../models/menuItem.model');
const Category = require('../models/category.model');
const mongoose = require('mongoose');

const createMenuItem = async (req, res) => {
  const { name, description, price, category, imageUrl, stock, isAvailable } = req.body;

  if (!name || price === undefined || !category) {
    return res.status(400).json({ success: false, message: 'Please provide name, price, and category' });
  }

  let categoryId = category;
  if (!mongoose.Types.ObjectId.isValid(category)) {
    let cat = await Category.findOne({ name: category });
    if (!cat) {
      cat = await Category.create({ name: category });
    }
    categoryId = cat._id;
  }

  const menuItem = await MenuItem.create({
    name,
    description,
    price,
    category: categoryId,
    imageUrl,
    stock: stock || 0,
    isAvailable: isAvailable !== undefined ? isAvailable : true,
  });

  res.status(201).json({
    success: true,
    data: menuItem,
  });
};

const getMenuItems = async (req, res) => {
  const { category, search, page = 1, limit = 10 } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    } else {
      const cat = await Category.findOne({ name: { $regex: `^${category}$`, $options: 'i' } });
      if (cat) {
        query.category = cat._id;
      } else {
        return res.json({
          success: true,
          data: [],
          pagination: { page: Number(page), limit: Number(limit), total: 0, pages: 0 }
        });
      }
    }
  }

  const skipIndex = (Number(page) - 1) * Number(limit);
  const total = await MenuItem.countDocuments(query);
  const menuItems = await MenuItem.find(query)
    .populate('category', 'name')
    .skip(skipIndex)
    .limit(Number(limit));

  res.json({
    success: true,
    data: menuItems,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
};

const getMenuItemById = async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id).populate('category', 'name');
  if (menuItem) {
    res.json({ success: true, data: menuItem });
  } else {
    res.status(404).json({ success: false, message: 'Menu item not found' });
  }
};

const updateMenuItem = async (req, res) => {
  const { name, description, price, category, imageUrl, stock, isAvailable } = req.body;
  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    return res.status(404).json({ success: false, message: 'Menu item not found' });
  }

  if (name) menuItem.name = name;
  if (description) menuItem.description = description;
  if (price !== undefined) menuItem.price = price;
  if (imageUrl) menuItem.imageUrl = imageUrl;
  if (stock !== undefined) menuItem.stock = stock;
  if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;

  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      menuItem.category = category;
    } else {
      let cat = await Category.findOne({ name: category });
      if (!cat) {
        cat = await Category.create({ name: category });
      }
      menuItem.category = cat._id;
    }
  }

  const updatedItem = await menuItem.save();
  res.json({ success: true, data: updatedItem });
};

const deleteMenuItem = async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);
  if (!menuItem) {
    return res.status(404).json({ success: false, message: 'Menu item not found' });
  }
  await MenuItem.deleteOne({ _id: req.params.id });
  res.json({ success: true, message: 'Menu item removed' });
};

module.exports = {
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
};
