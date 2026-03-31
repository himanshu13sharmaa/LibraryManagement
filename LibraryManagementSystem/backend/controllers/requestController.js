const Request = require('../models/Request');
const Transaction = require('../models/Transaction');
const Item = require('../models/Item');

exports.createRequest = async (req, res) => {
    try {
        const { itemId } = req.body;
        const request = await Request.create({ item: itemId, user: req.user._id });
        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRequests = async (req, res) => {
    try {
        const requests = await Request.find({}).populate('item').populate('user');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyRequests = async (req, res) => {
    try {
        const requests = await Request.find({ user: req.user._id, status: 'Pending' }).populate('item');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateRequest = async (req, res) => {
    try {
        const { status } = req.body;
        const request = await Request.findById(req.params.id).populate('item');
        if (request) {
            // Handle formal Issue logic if status being changed is Approved
            if (status === 'Approved' && request.status === 'Pending') {
                const item = await Item.findById(request.item._id);
                if (!item || item.availableCopies <= 0 || item.status === 'Unavailable') {
                    return res.status(400).json({ message: 'Item currently out of stock or unavailable.' });
                }

                // Execute 15 day max loan period exactly as Transactions module does
                const issueDate = Date.now();
                const expectedReturnDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

                await Transaction.create({
                    item: item._id,
                    user: request.user,
                    issueDate,
                    expectedReturnDate
                });

                item.availableCopies -= 1;
                await item.save();
            }

            request.status = status;
            await request.save();
            res.json(request);
        } else {
            res.status(404).json({ message: 'Request not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
