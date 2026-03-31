const Item = require('../models/Item');

// @desc Get all items (Search included)
// @route GET /api/items
// @access Private
exports.getItems = async (req, res) => {
    try {
        const keyword = req.query.keyword ? {
            $or: [
                { name: { $regex: req.query.keyword, $options: 'i' } },
                { author: { $regex: req.query.keyword, $options: 'i' } },
                { category: { $regex: req.query.keyword, $options: 'i' } },
                { serialNo: { $regex: req.query.keyword, $options: 'i' } }
            ]
        } : {};
        
        const typeFilter = req.query.type ? { type: req.query.type } : {};

        const items = await Item.find({ ...keyword, ...typeFilter });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Add an item
// @route POST /api/items
// @access Admin
exports.addItem = async (req, res) => {
    try {
        const { type, serialNo, name, author, category, procurementDate, quantity } = req.body;
        const itemExists = await Item.findOne({ serialNo });
        if (itemExists) {
            return res.status(400).json({ message: 'Item with this serial number already exists' });
        }

        const item = await Item.create({
            type, serialNo, name, author, category, procurementDate, 
            quantity: quantity || 1, 
            availableCopies: quantity || 1
        });
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Update an item
// @route PUT /api/items/:id
// @access Admin
exports.updateItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (item) {
            item.status = req.body.status || item.status;
            item.name = req.body.name || item.name;
            item.serialNo = req.body.serialNo || item.serialNo;
            item.category = req.body.category || item.category;
            item.author = req.body.author || item.author;
            // Handle quantity updates safely
            if (req.body.quantity !== undefined && req.body.quantity >= 0) {
                const diff = req.body.quantity - item.quantity;
                item.quantity = req.body.quantity;
                item.availableCopies += diff;
            }

            const updatedItem = await item.save();
            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
