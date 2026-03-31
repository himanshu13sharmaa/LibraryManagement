const express = require('express');
const router = express.Router();
const { createRequest, getRequests, getMyRequests, updateRequest } = require('../controllers/requestController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, createRequest).get(protect, admin, getRequests);
router.route('/my').get(protect, getMyRequests);
router.route('/:id').put(protect, admin, updateRequest);

module.exports = router;
