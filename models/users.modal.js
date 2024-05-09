const mongoose = require('mongoose');
const { token } = require('morgan');

const userShema = new mongoose.Schema({
    username: { type: String, unique: true},
    password: { type: String },
    first_name: { type: String },
    last_name: { type: String },
    email: { type: String },
    token: {type: String },
    role: { type: String, default: "customer"},
    approve: { type: Boolean, default: false},
});

module.exports = mongoose.model('users', userShema);