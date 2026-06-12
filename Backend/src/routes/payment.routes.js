const express = require('express');
const { verifyEsewa, verifyKhalti } = require('../controllers/payment.controller');
const { paymentRateLimiter } = require('../middleware/rateLimit.middleware');

const router = express.Router();

router.post('/esewa', paymentRateLimiter, verifyEsewa);
router.post('/khalti', paymentRateLimiter, verifyKhalti);

module.exports = router;
