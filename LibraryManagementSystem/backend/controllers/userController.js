const User = require('../models/User');

// @desc Get all users
// @route GET /api/users
// @access Admin
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Add a new user
// @route POST /api/users
// @access Admin
exports.addUser = async (req, res) => {
    const { firstName, lastName, email, password, contactAddress, aadharNo, membership, role, active } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        let mergedMembership = { duration: '6 months', startDate: new Date() };
        if (membership) {
            mergedMembership = { ...mergedMembership, ...membership };
        }
        
        let endDate = new Date(mergedMembership.startDate);
        if (mergedMembership.duration === '6 months') endDate.setMonth(endDate.getMonth() + 6);
        else if (mergedMembership.duration === '1 year') endDate.setFullYear(endDate.getFullYear() + 1);
        else if (mergedMembership.duration === '2 years') endDate.setFullYear(endDate.getFullYear() + 2);
        
        mergedMembership.endDate = endDate;

        const user = await User.create({
            firstName, lastName, email, password, contactAddress, aadharNo, role: role || 'User', active: active !== undefined ? active : true, membership: mergedMembership
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Update user
// @route PUT /api/users/:id
// @access Admin
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.firstName = req.body.firstName || user.firstName;
            user.lastName = req.body.lastName || user.lastName;
            user.email = req.body.email || user.email;
            user.contactAddress = req.body.contactAddress || user.contactAddress;
            user.aadharNo = req.body.aadharNo || user.aadharNo;
            user.role = req.body.role || user.role;
            if (req.body.active !== undefined) user.active = req.body.active;
            
            if (req.body.membership) {
                 user.membership = { ...user.membership.toObject(), ...req.body.membership };
                 if (req.body.membership.duration || req.body.membership.startDate) {
                     let endDate = new Date(user.membership.startDate);
                     if (user.membership.duration === '6 months') endDate.setMonth(endDate.getMonth() + 6);
                     if (user.membership.duration === '1 year') endDate.setFullYear(endDate.getFullYear() + 1);
                     if (user.membership.duration === '2 years') endDate.setFullYear(endDate.getFullYear() + 2);
                     user.membership.endDate = endDate;
                 }
            }
            if (req.body.password) {
                user.password = req.body.password;
            }
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete user
// @route DELETE /api/users/:id
// @access Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await User.deleteOne({ _id: user._id });
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get user profile
// @route GET /api/users/profile
// @access Private
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
