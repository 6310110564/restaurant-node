var express = require('express');
var router = express.Router();

const productModel = require("../models/product.modal");
const cartModel = require("../models/cart.modal");
const usersModal = require("../models/users.modal");
const orderModel = require("../models/order.modal");
const mongoose = require('mongoose');
const auth = require("../middleware/auth");


// /* GET All Product */
// router.get("/", async function (req, res, next) {
//     try {
        
//         let cart = await cartModel.find();

//         const orders = await productModel
//             .find({ product_id: product_id})
//             .populate("product_id", "product_name")

//         return res.status(200).send({
//             status: "200",
//             message: "success",
//             data: orders
//         })

//     }catch (error){
//         return res.status(500).send({
//             status: "500",
//             message: (error.toString())
//         })
//     }
// })

router.get("/", async function (req, res, next) {
    try {
        let carts = await cartModel.find();

        console.log('cart: ', carts)

        let promises = carts.map(async (cart) => {
            let product = await productModel.findById(cart.product_id);
            return {
                cart_id: cart._id,
                product: product,
                amount: cart.amount
            };
        });

        let orders = await Promise.all(promises);

        return res.status(200).send({
            status: "200",
            message: "success",
            data: orders
        });

    } catch (error) {
        return res.status(500).send({
            status: "500",
            message: error.toString()
        });
    }
});


/* GET Product By ID */
router.get("/:id", async function (req, res, next) {
    try {
        let cart_id = req.params.id;
        let cart = await cartModel.findById(cart_id)

        return res.status(200).send({
            status: "200",
            message: "success",
            data: cart
        })
    } catch (error) {
        return res.status(500).send({
            status: "500",
            message: (error.toString())
        })
    }
})

/* POST Cart */
// router.post('/', async function (req, res, next) {
//     try {

//         const { product_name, price, stock } = req.body;

//         let newProduct = new productModel({
//             product_name: product_name,
//             // product_img: req.file.filename,
//             price: price,
//             stock: stock
//         });

//         let product = await newProduct.save();
//         console.log('new: ', newProduct)
//         console.log(product);

//         return res.status(201).send({
//             status: "201",
//             message: "create success",
//             data: product,
//         });

//     } catch (error) {
//         res.status(500).send({
//             status: "500",
//             message: (error.toString())
//         });
//     }
// });

/* PUT Cart */
router.put('/:id', async function (req, res, next) {
    try {

        let { amount } = req.body;
        
        let put_id = req.params.id;
        let put_cart = await cartModel.findByIdAndUpdate(put_id, { amount }, { new: true })

        return res.status(200).send({
            status: "200",
            message: put_cart
        })

    } catch (error) {
        res.status(500).send({
            status: "500",
            message: (error.toString())
        });
    }
})

/* DELETE Cart */
router.delete('/:id', async function (req, res, next) {
    try {

        let delete_id = req.params.id;

        let delete_cart = await cartModel.findByIdAndDelete(delete_id)

        return res.status(200).send({
            status: "200",
            message: "delete succes",
            data: delete_cart
        })
        
    } catch (error) {
        res.status(500).send({
            status: "500",
            message: (error.toString())
        });
    }
})

module.exports = router;