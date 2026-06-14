const express = require('express');
const { updateUserRole } = require('../controllers/admin.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(verifyToken);
router.use(isAdmin);

router.patch('/users/:id/role', updateUserRole);

module.exports = router;
