const mongoose = require('mongoose');

// define user schema
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    hashedPassword: { type: String, default: '' },
    email: { type: String, unique: true, required: true },
    following: { type: [String], default: [] },
    // a boolean to indicate whether a user sign with google
    auth: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);
