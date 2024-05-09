var express = require('express');
var router = express.Router();

const usersModel = require('../models/users.modal');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const auth = require('../middleware/auth');

router.get('/', auth, async function(req, res, next) {
  try {

    const role = req.user.role;
    console.log('name: ', role);

    if(role === 'admin') {
      const users = await usersModel.find();

      return res.status(200).send({
        status: "200",
        message: "success",
        data: users
      });  

    } else {
      return res.status(403).send({
        status: "403",
        message: "Access Denied"
      });
    }

  } catch (error) {
    res.status(500).send({
      status: "500",
      message: (error.toString())
    })
  }
});

/* POST (Register) User */
router.post('/register', async function (req, res, next) {
  try {
     
    let { username, password, first_name, last_name, email, role } = req.body;
    let hashPassword = await bcrypt.hash(password, 10);

    const newUser = new usersModel({
      username,
      password: hashPassword,
      first_name,
      last_name,
      email,
      role
    });

    //create token
    const token = jwt.sign(
      {
        username,
        password
      }, process.env.TOKEN_KEY,
      {
        expiresIn: "2h"
      }
    )

    // save users token
    newUser.token = token


    const user = await newUser.save();
    return res.status(201).send({
      status: "201",
      message: "create success",
      data: { _id: user.id, username, first_name, last_name, email, role }
    });
  } catch (error){
      res.status(500).send({
        status: "500",
        message: (error.toString())
      })
  }
})

/* admin confirm */
router.put('/:id', auth, async function(req, res, next) {
  try {

    const role = req.user.role;

    if(role === 'admin') {
      let { approve } = req.body;

      let update = await usersModel.findByIdAndUpdate(req.params.id, { approve }, { new: true })
      
      return res.status(200).send({
        status: "200",
        message: "updated",
        data: update
      })
    } else {
      return res.status(401).send({
        status: "401",
        message: "Access Denied"
      });
    }
  } catch (error) {
    res.status(500).send(error.toString())
  }
})

module.exports = router;
