const mongoose = require('mongoose');

const productShema = new mongoose.Schema({
    product_name: { type: String },
    product_img: { type: String },
    price: { type: Number },
    stock: { type: Number },
    // orders : [{ type: Object, ref: 'orders' }]
    orders : [{ type: Object }]
}, {
    timestamps: true
});

module.exports = mongoose.model("products", productShema);