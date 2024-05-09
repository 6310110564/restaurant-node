var express = require('express');
var router = express.Router();

const productModel = require("../models/product.modal");
const usersModal = require("../models/users.modal");
const orderModel = require("../models/order.modal");
const mongoose = require('mongoose');
const auth = require("../middleware/auth")

/* GET All Product */
router.get("/",auth , async function (req, res, next) {
    try {
        
        let product = await productModel.find();

        return res.status(200).send({
            status: "200",
            message: "success",
            data: product,
        });
    }catch (error){
        return res.status(500).send({
            status: "500",
            message: (error.toString())
        })
    }
})

/* GET Product By ID */
router.get("/:id", auth,  async function (req, res, next) {
    try {
        let id = req.params.id;
        let product = await productModel.findById(id)

        return res.status(200).send({
            status: "200",
            message: "success",
            data: product
        })
    } catch (error) {
        return res.status(500).send({
            status: "500",
            message: (error.toString())
        })
    }
})

/* POST Product */
router.post('/', auth, async function (req, res, next) {
    try {

        const { product_name, price, stock } = req.body;

        let newProduct = new productModel({
            product_name: product_name,
            price: price,
            stock: stock
        });

        let product = await newProduct.save();

        return res.status(201).send({
            status: "201",
            message: "create success",
            data: product,
        });

    } catch (error) {
        res.status(500).send({
            status: "500",
            message: (error.toString())
        });
    }
});

/* DELETE Product By ID */
router.delete("/:id", auth, async function (req, res, next) {
    try {
        
        let id = req.params.id;
        let delete_product = await productModel.findByIdAndDelete(id)

        return res.status(200).send({
            status: "200",
            message: "delected",
            data: delete_product
        });
    } catch (error) {
        res.status(500).send({
            status: "500",
            message: (error.toString())
        });
    }
})


/* GET Order in Product */
router.get("/:id/orders", auth, async function( req, res, next) {
    try {
        
        let id = req.params.id;
        
        let order_product = await productModel.findById(id, 'orders');
        
        return res.status(200).send({
            status: "200",
            message: "success",
            data: order_product
        })

    } catch (error) {
        return res.status(500).send({
            status: "500",
            message: (error.toString())
        })
    }
})

/* POST Order */
router.post('/:id/orders',auth , async function (req, res, next) {
    try {

        const { amount } = req.body;

        const product_id = req.params.id;
        const product = await productModel.findById(product_id);

        const auth_id = req.user.id;
        console.log('auth id: ', auth_id);

        if (!product) {
            return res.status(400).send({
                status: "404",
                message: "product not found"
            })
        }

        let total_amount = 0;

        for (let i = 0; i < product.orders.length; i++) {
            //เข้าถึง order ที่อยู่ภายในทุกตัว
            const order = product.orders[i];

            //บวก order.amount แต่ละตัว
            total_amount += order.amount;
        }
        
        // console.log('Total amount:', total_amount);

        const stock_remaining = product.stock - total_amount;
        // console.log('stock_remaining: ', stock_remaining);
        

        //ถ้ามี stock เหลือมากกว่า 0
        if ( stock_remaining > 0 ) {

            const customer = await usersModal.findById(auth_id);

            if (!customer) {
                return res.status(404).send({
                    status: "404",
                    message: "customer not found"
                });
            }

            let newOrder = new orderModel({
                product_id: product_id,
                amount: amount,
                customer: {
                    _id: customer._id,
                    first_name: customer.first_name,
                    last_name: customer.last_name
                }
            });

            //ถ้า stock ที่เหลืออยู่ มากกว่า จำนวนของที่ต้องการสั่งใหม่ (newOrder.amount)
            if ( stock_remaining >= newOrder.amount) {

                let order = await newOrder.save();

                console.log('orders: ', order);

                const formattedOrder = {
                    product_id: order.product_id,
                    amount: order.amount,
                    customer: order.customer,
                };

                product.orders.push(formattedOrder);
                let product_new = await product.save();

                return res.status(201).send({
                    status: "201",
                    message: "Create success",
                    data: product_new
                });

            } else {
                res.status(500).send({
                    status: "500",
                    message: `Not enough stock. stock remaining ${stock_remaining}`
                });
            }

        } else {
            res.status(500).send({
                status: "500",
                message: "out of stock"
            });
        }

    } catch (error) {
        res.status(500).send({
            status: "500",
            message: (error.toString())
        });
    }
});

/* DELETE Order */


module.exports = router;