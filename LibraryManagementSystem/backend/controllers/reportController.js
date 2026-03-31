const Transaction = require('../models/Transaction');
const Item = require('../models/Item');
const User = require('../models/User');
const Request = require('../models/Request');

exports.getReports = async (req, res) => {
    try {
        const { type } = req.query; // master_items, master_users, active_issues, overdue_returns
        
        if (type === 'master_items') {
            const items = await Item.find({});
            return res.json(items);
        }
        if (type === 'master_books') {
            const items = await Item.find({ type: 'Book' });
            return res.json(items);
        }
        if (type === 'master_movies') {
            const items = await Item.find({ type: 'Movie' });
            return res.json(items);
        }
        if (type === 'master_users') {
            const users = await User.find({ role: 'User' }).select('-password');
            return res.json(users);
        }
        if (type === 'active_users') {
            const users = await User.find({ role: 'User', active: true }).select('-password');
            return res.json(users);
        }
        if (type === 'master_memberships') {
            const users = await User.find({ role: 'User', 'membership.endDate': { $gte: new Date() } }).select('-password');
            return res.json(users);
        }
        if (type === 'pending_requests') {
            const requests = await Request.find({ status: 'Pending' }).populate('item').populate('user');
            return res.json(requests);
        }
        if (type === 'active_issues') {
            const transactions = await Transaction.find({ status: 'Issued' }).populate('item').populate('user');
            return res.json(transactions);
        }
        if (type === 'overdue_returns') {
            const transactions = await Transaction.find({ 
                status: 'Issued',
                expectedReturnDate: { $lt: new Date() }
            }).populate('item').populate('user');
            
            // Re-calculate fine for accurate report
            const result = transactions.map(t => {
                const diffTime = Math.abs(new Date() - new Date(t.expectedReturnDate));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return {
                    ...t.toObject(),
                    currentFine: diffDays * 10
                };
            });
            return res.json(result);
        }
        res.status(400).json({ message: 'Invalid report type' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
