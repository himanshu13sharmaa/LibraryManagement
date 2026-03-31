const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issueDate: { type: Date, required: true, default: Date.now },
    expectedReturnDate: { type: Date, required: true },
    actualReturnDate: { type: Date },
    fineCalculated: { type: Number, default: 0 },
    finePaid: { type: Boolean, default: false },
    remarks: { type: String },
    status: { type: String, enum: ['Issued', 'Returned'], default: 'Issued' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
