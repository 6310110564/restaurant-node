var express = require('express');
var router = express.Router();

const productModel = require("../models/product.modal");
const usersModal = require("../models/users.modal");
const orderModel = require("../models/order.modal");
const mongoose = require('mongoose');
const auth = require("../middleware/auth");
const cartModal = require('../models/cart.modal');
// var multer = require('multer');

//--------------upload file----------------------
// const storage = multer.diskStorage({
//     //file ที่จะเอารูปไปเก็บไว้
//     destination: function (req, file, cb) {
//       cb(null, 'public/images')
//     },
//     filename: function (req, file, cb) {
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//       cb(null, uniqueSuffix + '_' + file.originalname)
//     }
//   })
  
//   const upload = multer({ storage: storage })

/* GET All Product */
router.get("/", async function (req, res, next) {
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
// router.get("/", async function (req, res, next) {
//     try {
//         let products = await productModel.find().populate({
//             path: 'cart_id',
//             populate: {
//                 path: 'products',
//                 match: { _id: req.params.productId }
//             }
//         });

//         // Filter out products that do not have matching carts
//         let productsWithMatchingCarts = products.filter(product => product.cart_id.length > 0);

//         return res.status(200).send({
//             status: "200",
//             message: "success",
//             data: productsWithMatchingCarts,
//         });
//     } catch (error) {
//         return res.status(500).send({
//             status: "500",
//             message: (error.toString())
//         });
//     }
// });

/* GET Product By ID */
router.get("/:id", async function (req, res, next) {
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
router.post('/', async function (req, res, next) {
    try {

        const { product_name, product_img, price, stock } = req.body;

        let newProduct = new productModel({
            product_name: product_name,
            // product_img: req.file.filename,
            product_img: product_img,
            price: price,
            stock: stock
        });

        let product = await newProduct.save();
        console.log('new: ', newProduct)
        console.log(product);

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

/* PUT Product */
router.put('/:id', async function(req, res, next) {
    try {
        
        let id = req.params.id
        let { price, stock } = req.body;

        let update = await productModel.findByIdAndUpdate(id, { price, stock }, { new: true })

        return res.status(200).send({
            status: "200",
            message: update
        })

    } catch (error) {
        res.status(500).send({
            status: "500",
            message: (error.toString())
        });
    }
})

/* DELETE Product By ID */
router.delete("/:id", async function (req, res, next) {
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
router.get("/:id/orders", async function( req, res, next) {
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
router.post('/:id/orders', async function (req, res, next) {
    try {

        const { amount, user_id } = req.body;

        const product_id = req.params.id;
        const product = await productModel.findById(product_id);

        // const auth_id = req.user.id;
        // console.log('auth id: ', auth_id);

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

            const customer = await usersModal.findById(user_id);
            console.log(customer);

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
                    order_id: order._id,
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


/* GET CARTS */
router.get('/:id/carts', async(req, res, next ) => {
    try {
        const product_id = req.params.id;

        const orders = await productModel
            .find({ product_id: product_id})
            .populate("product_id", "product_name")
            .populate("userId", "FirstName");

        return res.status(200).send({
            status: "200",
            message: "success",
            data: orders
        })
    } catch (error) {
        res.status(500).send({
            status: "500",
            message: (error.toString())
        });
    }
})

// /*  POST Order */
router.post("/:id/carts", async (req, res, next) => {
    try {
        const product_id = req.params.id;
        const { amount, user_id } = req.body;

        const product = await productModel.findById(product_id);

        if(amount > product.stock) {
            return res.status(400).send({
                status: "400",
                message: "ไม่สามารถเพิ่ม order ได้ เนื่องจากจำนวน stock ไม่เพียงพอ"
            })
        }

        // product.stock -= amount;
        await product.save();

        const newOrder = new cartModal({
            product_id: product_id,
            amount: amount,
            user_id: user_id,
        })

        const order = await newOrder.save()
        return res.status(200).send({
            status: "200",
            message: "create success",
            data: order
        })

    } catch (error) {
        res.status(500).send({
            status: "500",
            message: (error.toString())
        });
    }
})

module.exports = router;