var express = require('express');
var router = express.Router();

const usersModel = require('../models/users.modal');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/* POST (Login) User */
router.post("/login", async function (req, res, next) {

  try {
    let { username, password } = req.body;

    let user = await usersModel.findOne({
      username: username
    });

    if(!user) {
      return res.status(500).send({
        status: "500",
        message: "login fail",
      });
    }

    console.log('user: ', user);

    const checkpassword = await bcrypt.compare(password, user.password);
    if(!checkpassword) {
      return res.status(500).send({
        status: "500",
        message: "login fail"
      });
    }

    console.log('user approve: ', user.approve);

    //create token
    const token = jwt.sign(
      { 
        id: user._id,
        username, 
        password,
        role: user.role,
        // approve: user.approve
      },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h"
      } 
    )

    //save token
    user.token = token


    if(user.approve === true) {
      const { _id, first_name, last_name, email } = user;
      return res.status(200).send({
        status: "200",
        message: "login success",
        data: { _id, first_name, last_name, email, token } 
      })
    } else {
      return res.status(403).send({
        status: "403",
        message: "Waiting to approve"
      })
    }


  } catch (error) {
    return res.status(500).send({
      status: "500",
      message: (error.toString())
    })
  }
})

module.exports = router;
