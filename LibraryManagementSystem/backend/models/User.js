const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contactAddress: { type: String },
    aadharNo: { type: String },
    role: { type: String, enum: ['Admin', 'User'], default: 'User' },
    active: { type: Boolean, default: true },
    membership: {
        duration: { type: String, enum: ['6 months', '1 year', '2 years'], default: '6 months' },
        startDate: { type: Date },
        endDate: { type: Date }
    }
}, { timestamps: true });

// Password hashing
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
