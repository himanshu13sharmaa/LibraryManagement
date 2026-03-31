const Transaction = require('../models/Transaction');
const Item = require('../models/Item');
const User = require('../models/User');

// @desc Issue an item to a user
// @route POST /api/transactions/issue
// @access Admin
exports.issueItem = async (req, res) => {
    try {
        const { serialNo, userId, issueDate, expectedReturnDate } = req.body;

        const item = await Item.findOne({ serialNo });
        if (!item || item.availableCopies <= 0 || item.status === 'Unavailable') {
            return res.status(400).json({ message: 'Item not available' });
        }

        const user = await User.findById(userId);
        if (!user || (!user.active)) {
             return res.status(400).json({ message: 'Invalid or inactive user' });
        }

        // Create transaction
        const transaction = await Transaction.create({
            item: item._id,
            user: user._id,
            issueDate: issueDate || Date.now(),
            expectedReturnDate: expectedReturnDate
        });

        // Update item copies
        item.availableCopies -= 1;
        await item.save();

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Return an item
// @route POST /api/transactions/return/:id
// @access Admin
exports.returnItem = async (req, res) => {
    try {
        const { actualReturnDate, remarks } = req.body;
        const transaction = await Transaction.findById(req.params.id).populate('item');
        
        if (!transaction || transaction.status === 'Returned') {
             return res.status(400).json({ message: 'Transaction not found or already returned' });
        }

        const returnDate = new Date(actualReturnDate || Date.now());
        const expectedDate = new Date(transaction.expectedReturnDate);
        
        let fine = 0;
        if (returnDate > expectedDate) {
             const diffTime = Math.abs(returnDate - expectedDate);
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
             fine = diffDays * 10; // Rs 10 per day fine
        }

        transaction.actualReturnDate = returnDate;
        transaction.fineCalculated = fine;
        transaction.remarks = remarks || '';
        transaction.status = 'Returned';
        
        await transaction.save();

        // Update item copies
        const item = await Item.findById(transaction.item._id);
        if (item) {
             item.availableCopies += 1;
             await item.save();
        }

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Pay Fine
// @route POST /api/transactions/pay-fine/:id
// @access Private
exports.payFine = async (req, res) => {
     try {
         const transaction = await Transaction.findById(req.params.id);
         if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
         
         if (transaction.fineCalculated > 0 && !transaction.finePaid) {
             transaction.finePaid = true;
             await transaction.save();
             res.json({ message: 'Fine paid successfully', transaction });
         } else {
             res.status(400).json({ message: 'No pending fine to pay' });
         }
     } catch (error) {
         res.status(500).json({ message: error.message });
     }
};

// @desc Get my transactions
// @route GET /api/transactions/my
// @access Private
exports.getMyTransactions = async (req, res) => {
     try {
         const transactions = await Transaction.find({ user: req.user._id }).populate('item');
         res.json(transactions);
     } catch (error) {
         res.status(500).json({ message: error.message });
     }
};
