const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    type: { type: String, enum: ['Book', 'Movie'], required: true, default: 'Book' },
    serialNo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    author: { type: String }, // optional for movies
    category: { type: String, enum: ['Science', 'Economics', 'Fiction', 'Children', 'Personal Development'], required: true },
    procurementDate: { type: Date, required: true, default: Date.now },
    quantity: { type: Number, required: true, default: 1 },
    availableCopies: { type: Number, required: true, default: 1 },
    status: { type: String, enum: ['Available', 'Unavailable'], default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);
