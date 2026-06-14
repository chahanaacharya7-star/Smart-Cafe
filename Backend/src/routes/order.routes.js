const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAdminOrders,
} = require('../controllers/order.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const { orderRateLimiter } = require('../middleware/rateLimit.middleware');

const router = express.Router();

router.use(verifyToken);

router.route('/')
  .post(orderRateLimiter, createOrder)
  .get(isAdmin, getAdminOrders);

router.get('/my', getMyOrders);

router.route('/:id')
  .get(getOrderById);

router.patch('/:id/status', isAdmin, updateOrderStatus);

module.exports = router;
