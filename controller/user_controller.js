var express = require('express');
var router = express.Router();
const { Validator } = require('node-input-validator');
const helper = require('../helper');
var jwt = require('jsonwebtoken');
const Users = require('../models/User');

module.exports = {
  users_list: async (req, res) => {
    try {
      let users = await Users.find();
      users = users.filter((user) => {
        if (user.role != 'Admin') {
          return user;
        }
      });
      if (users) {
        return res.status(200).json({
          success: '1',
          code: 200,
          message: '',
          body: users,
        });
      } else {
        return helper.failed(res, 'No users yet.');
      }
    } catch (error) {
      console.log(error, '======error');
    }
  },

  get_profile: async (req, res) => {
    try {
      let id = req.query.id;
      let user = await Users.findOne({ _id: id });
      if (user) {
        return res.status(200).json({
          success: '1',
          code: 200,
          message: 'User profile Details',
          body: user,
        });
      } else {
        return helper.failed(res, 'No users yet.');
      }
    } catch (error) {
      console.log(error, '======error');
    }
  },

  add_friend: async (req, res) => {
    try {
      let user = req.user;
      let userID = req.body;
      let followers = [...user.followers, user._id.toString()];
      let addUser = await Users.findOneAndUpdate(
        { _id: userID.userID },
        { followers: followers }
      );
      console.log(addUser);
      if (addUser) {
        return res.status(200).json({
          success: '1',
          code: 200,
          message: 'Request sent successfully',
          body: '',
        });
      } else {
        return helper.failed(res, 'No users yet.');
      }
    } catch (error) {
      console.log(error, '======error');
    }
  },
};
