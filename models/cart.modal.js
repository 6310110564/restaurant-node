const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number },
    customer: { type: Object },
}, {
    timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);
