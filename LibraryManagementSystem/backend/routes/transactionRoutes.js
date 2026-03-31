const express = require('express');
const router = express.Router();
const { issueItem, returnItem, payFine, getMyTransactions } = require('../controllers/transactionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/issue').post(protect, admin, issueItem);
router.route('/return/:id').post(protect, admin, returnItem);
router.route('/pay-fine/:id').post(protect, payFine);
router.route('/my').get(protect, getMyTransactions);

module.exports = router;
