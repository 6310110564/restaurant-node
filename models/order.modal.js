const mongoose = require('mongoose');

const orderShema = new mongoose.Schema({
    product_id: { type: String },
    amount: { type: Number },
    customer: { type: Object, ref: 'users' },
}, {
    timestamps: true
});

module.exports = mongoose.model('orders', orderShema);