var express = require('express');
var router = express.Router();

const orderModel = require("../models/order.modal");
const mongoose = require('mongoose');

const auth = require('../middleware/auth');
const productModel = require('../models/product.modal');
const cartModel = require('../models/cart.modal');

/* GET Order */
router.get('/', async function(req, res, next) {
    try {

        let orders = await orderModel.find();

        let promises = orders.map(async (order) => {
            let product = await productModel.find();
            let cartWithProducts = await Promise.all(cart.map(async (cartItem) => {
                let product = await productModel.findById(cartItem.product_id);
                return {
                    product_id: cartItem.product_id,
                    amount: cartItem.amount,
                    product: product
                };
            }));
            return {
                order_id: order._id,
                cart: cartWithProducts,
            };
        });

        let result = await Promise.all(promises);

        return res.status(200).send({
          status: "200",
          message: "success",
          data: result
        })
    } catch (error) {
      res.status(500).send(error.toString())
    }
})


/* DELETE Order */
router.delete('/:id', async function(req, res, next) {
  try {
      const order_id = req.params.id;

      let order = await orderModel.findById(order_id);
      if (!order) {
          return res.status(404).send({
              status: "404",
              message: "Order not found"
          });
      }

      const product_id = order.product_id;
      let product = await productModal.findById(product_id);

      if (!product) {
          return res.status(404).send({
              status: "404",
              message: "Product not found"
          });
      }

      // Filter out the order to be deleted from product.orders[]
      product.orders = product.orders.filter(existingOrder => existingOrder.order_id !== order_id);
      await product.save();

      // Delete the order
      let deleted_order = await orderModel.findByIdAndDelete(order_id);

      return res.status(201).send({
          status: "201",
          message: "Delete success",
          data: deleted_order
      });

  } catch (error) {
      return res.status(500).send({
          status: "500",
          message: error.toString()
      });
  }
});

/* POST Orders */
router.post('/', async (req, res) => {
    try {
        const { customer_id, cart_id } = req.body;

        const newOrder = new orderModel({
            customer_id,
            cart_id
        });

        const savedOrder = await newOrder.save();

        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;