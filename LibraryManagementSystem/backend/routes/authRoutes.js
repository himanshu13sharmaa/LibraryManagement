const express = require('express');
const router = express.Router();
const { authUser, registerAdmin } = require('../controllers/authController');

router.post('/login', authUser);
router.post('/register-admin', registerAdmin);

module.exports = router;
