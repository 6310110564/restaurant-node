const mongoose = require('mongoose');

const orderShema = new mongoose.Schema({
    product_id: { type: String },
    amount: { type: Number },
    custumer: { type: Object, ref: 'users' },
})

module.exports = mongoose.model('orders', orderShema);