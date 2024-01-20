var express = require('express');
var router = express.Router();
const { Validator } = require('node-input-validator');
const helper = require('../helper');
var jwt = require("jsonwebtoken");
const Users = require("../models/User");
/* GET users listing. */



module.exports = {
    sign_up: async function (req, res) {
        try {
            let v = new Validator(req.body, {
                name: 'required',
                email: 'required',
                countryCode: 'required',
                password: 'required',
                phoneNumber: 'required'
            });

            var errorsResponse
            await v.check().then(function (matched) {
                if (!matched) {
                    var valdErrors = v.errors;
                    var respErrors = [];
                    Object.keys(valdErrors).forEach(function (key) {
                        if (valdErrors && valdErrors[key] && valdErrors[key].message) {
                            respErrors.push(valdErrors[key].message);
                        }
                    });
                    errorsResponse = respErrors.join(', ');
                }
            });
            if (errorsResponse) {
                return helper.failed(res, errorsResponse)
            }

            //-----------CHECK IF EMAIL & PHONE NUMBER EXISTS----------------------

            let { name,
                email,
                countryCode,
                password,
                phoneNumber } = req.body;
            let checkEmail = await Users.findOne({ "email": email });
            let checkPhoneNumber = await Users.findOne({ "phoneNumber": phoneNumber });



            if (checkEmail) {
                return helper.failed(res, 'Email already exists. Please use another.')
            }
            if (checkPhoneNumber) {
                return helper.failed(res, 'Phone Number already exists. Please use another.')
            }

            let otp = Math.floor(1000 + Math.random() * 9000);

            let createUser = await Users.create({
                name: name,
                email: email,
                countryCode: countryCode,
                phoneNumber: phoneNumber,
                password: helper.bcryptHash(password),
                role: "User"
            });

            if (createUser) {
                return res.status(200).json({
                    'success': "1",
                    'code': 200,
                    'message': "Sign Up successfully",
                    'body': createUser
                });

            }
        } catch (error) {
            return helper.failed(res, error)

        }
    },



    user_login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const users = await Users.findOne({ email: email });
            if (users) {
                const checkPassword = await helper.comparePass(password, users.password);
                const user = { id: users._id.toString() }
                const accesstoken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
                if (users.email == email && checkPassword == true && accesstoken) {
                    let updateUser = await Users.findOneAndUpdate({ _id: users._id }, {
                        token: accesstoken
                    });
                    if (updateUser.token) {
                        return res.status(200).json({
                            'success': "1",
                            'code': 200,
                            'message': " User Login successfully",
                            'body': updateUser
                        });
                    } else {
                        updateUser = {
                            ...updateUser._doc,
                            "token": accesstoken
                        };
                        return res.status(200).json({
                            'success': "1",
                            'code': 200,
                            'message': " User Login successfully",
                            'body': updateUser
                        });
                    }
                }
                else {
                    return helper.failed(res, 'Wrong Credentials.')
                }
            } else {
                return helper.failed(res, 'User not found.')

            }
        } catch (error) {
            console.log(error, '======error');
        }
    },



    verify_otp: async (req, res) => {
        try {
            const { otp } = req.body;
            const users = await Users.findOne({ otp: otp });
            if (users) {
                let upadteUser = await Users.findOneAndUpdate({ _id: users._id }, { otp: "" })
                return res.status(200).json({
                    'success': "1",
                    'code': 200,
                    'message': "User verified successfully",
                    'body': users
                });
            }
            else {
                return helper.failed(res, 'Wrong Otp.')
            }
        } catch (error) {
            console.log(error, '======error');
        }
    },


    forgot_password: async (req, res) => {
        try {
            const { email } = req.body;
            const users = await Users.findOne({ email: email });
            if (users) {
                let otp = Math.floor(1000 + Math.random() * 9000);
                let upadteUser = await Users.findOneAndUpdate({ _id: users._id }, { otp: otp });
                let sendMail = helper.send_emails(email, otp);
                return res.status(200).json({
                    'success': "1",
                    'code': 200,
                    'message': "User verified successfully",
                    'body': users
                });
            }
            else {
                return helper.failed(res, 'User not found')
            }
        } catch (error) {
            console.log(error, '======error');
        }
    },


    change_password: async (req, res) => {
        try {
            const { oldPassword, newPassword, id } = req.body;
            if (oldPassword == newPassword) {
                return helper.failed(res, 'Old And New Password not be same!');
            }
            const user = await Users.findOne({ _id: id });
            const checkPassword = await helper.comparePass(oldPassword, user.password);
            if (!checkPassword) {
                return helper.failed(res, 'Password not matching!');
            } else {
                let password = helper.bcryptHash(newPassword);
                const userUpdate = await Users.findOneAndUpdate({ _id: id }, { password: password });
                if (userUpdate) {
                    return res.status(200).json({
                        'success': "1",
                        'code': 200,
                        'message': "Password changed successfully",
                        'body': userUpdate
                    });
                }
                else {
                    return helper.failed(res, 'User not found')
                }
            }
        } catch (error) {
            console.log(error, '======error');
        }
    },


    signout: async (req, res) => {
        try {
            let user = req.user;
            const userUpdate = await Users.findOneAndUpdate({ _id: user._id.toString() }, { token: "" });
            if (userUpdate) {
                return res.status(200).json({
                    'success': "1",
                    'code': 200,
                    'message': "User logged out successfully",
                    'body': ""
                });
            }
        } catch (error) {
            console.log(error, '======error');
        }
    },

    socialLogin: async function (req, res) {
        try {
            const required = {
                firstname: req.body.firstname,
                email: req.body.email,
                socialId: req.body.socialId,
                socialType: req.body.socialType, //1 for facebook and 2 for google
            };

            const nonRequired = {
                deviceToken: req.body.deviceToken,
                deviceType: req.body.deviceType,
            };

            let requestData = await helper.vaildObject(required, nonRequired, res);

            let temp = {};

            const user = await Users.findOne({ socialId: requestData.socialId })

            const user_data = await Users.findOne({ email: req.body.email });

            if (user_data == null) {
                // Create New User
                const user_data = await Users.create(req.body);
                console.log('======newuser===========', user_data);
                let findusers = await Users.findOne({ socialId: req.body.socialId });
                const token = jwt.sign({ email: user_data.email }, 'secret');
                findusers.token = token;
                return helper.success(res, 'Login successfully', findusers);
            } else {
                await Users.findOneAndUpdate({ email: req.body.email, }, {
                    deviceToken: req.body.deviceToken,
                    deviceType: req.body.deviceType,
                });

                let finduser = await Users.findOne({ socialId: req.body.socialId, });

                let token = jwt.sign(
                    { id: user_data.id, email: user_data.email },
                    'secret',
                    {
                        expiresIn: '2h',
                    }
                );
                finduser.token = token;
                temp = requestData;
                temp.isAccountExisted = 1;

                return helper.success(res, 'Login successfully', finduser);
            }
        } catch (error) {
            helper.error(res, error);
        }
    },






}