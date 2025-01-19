const mongoose = require('mongoose');

// define user schema
const profileSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    headline: { type: String, default: '' },
    email: { type: String, unique: true, required: true },
    dob: { type: Number, required: true },
    phone: { type: String, required: true },
    zipcode: { type: String, required: true },
    avatar: { type: String, default: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png' },
});

module.exports = mongoose.model('Profile', profileSchema);