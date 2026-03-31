const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Item = require('./models/Item');
const connectDB = require('./config/db');

connectDB();

const seedDB = async () => {
    try {
        await User.deleteMany();
        await Item.deleteMany();
        
        await User.create({
            firstName: 'Super', lastName: 'Admin', email: 'admin@library.com', password: 'password', role: 'Admin'
        });
        
        await User.create({
            firstName: 'John', lastName: 'Doe', email: 'john@library.com', password: 'password', role: 'User',
            membership: { duration: '1 year', startDate: new Date(), endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) }
        });
        
        await Item.create([
             { type: 'Book', serialNo: 'SCB000001', name: 'A Brief History of Time', category: 'Science', quantity: 5, availableCopies: 5 },
             { type: 'Book', serialNo: 'ECB000001', name: 'Freakonomics', category: 'Economics', quantity: 3, availableCopies: 3 },
             { type: 'Movie', serialNo: 'SCM000001', name: 'Interstellar', category: 'Science', quantity: 2, availableCopies: 2 }
        ]);
        
        console.log('Database seeded successfully.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
seedDB();
