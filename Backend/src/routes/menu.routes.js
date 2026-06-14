const express = require('express');
const {
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menu.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
  .post(verifyToken, isAdmin, createMenuItem)
  .get(getMenuItems);

router.route('/:id')
  .get(getMenuItemById)
  .put(verifyToken, isAdmin, updateMenuItem)
  .delete(verifyToken, isAdmin, deleteMenuItem);

module.exports = router;
