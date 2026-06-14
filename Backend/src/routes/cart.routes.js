const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} = require('../controllers/cart.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(verifyToken);

router.route('/')
  .get(getCart);

router.post('/add', addToCart);
router.patch('/update', updateCartItem);
router.delete('/remove', removeCartItem);

module.exports = router;
