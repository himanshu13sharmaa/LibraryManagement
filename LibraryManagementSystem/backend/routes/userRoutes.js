const express = require('express');
const router = express.Router();
const { getUsers, addUser, updateUser, getUserProfile, deleteUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getUsers).post(protect, admin, addUser);
router.route('/profile').get(protect, getUserProfile);
router.route('/:id').put(protect, admin, updateUser).delete(protect, admin, deleteUser);

module.exports = router;
