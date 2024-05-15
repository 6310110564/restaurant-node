const mongoose = require('mongoose');

const productShema = new mongoose.Schema({
    product_name: { type: String },
    product_img: { type: String },
    price: { type: Number },
    stock: { type: Number },
    // orders : [{ type: Object, ref: 'orders' }]
    orders : [{ type: Object }],
    cart_id : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cart' }]
}, {
    timestamps: true
});

module.exports = mongoose.model("products", productShema);