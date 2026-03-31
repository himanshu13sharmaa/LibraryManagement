const express = require('express');
const router = express.Router();
const { getItems, addItem, updateItem } = require('../controllers/itemController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getItems).post(protect, admin, addItem);
router.route('/:id').put(protect, admin, updateItem);

module.exports = router;
