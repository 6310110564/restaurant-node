const mongoose = require('mongoose');

const orderShema = new mongoose.Schema({
    // product_id: { type: String },
    // amount: { type: Number },
    // customer: { type: Object, ref: 'users' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    cart_id : [{ type: mongoose.Schema.Types.ObjectId, ref: 'carts' }]
}, {
    timestamps: true
});

module.exports = mongoose.model('orders', orderShema);