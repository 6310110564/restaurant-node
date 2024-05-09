var express = require('express');
var router = express.Router();

const orderModel = require("../models/order.modal");
const mongoose = require('mongoose');

const auth = require('../middleware/auth');

/* GET Order */
router.get('/', auth, async function(req, res, next) {
    try {

        let orders = await orderModel.find();

        return res.status(200).send({
          status: "200",
          message: "success",
          data: orders
        })
    } catch (error) {
      res.status(500).send(error.toString())
    }
  })

module.exports = router;