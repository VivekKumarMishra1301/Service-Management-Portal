'use strict';
const bcrypt = require('bcrypt');
const Recipes = require('../../models/Recipies');
const Users = require('../../models/User');
const Tags = require('../../models/Tags');
const Reports = require('../../models/Reports');
const PrivatePolicy = require('../../models/PrivatePolicy');
const Services = require('../../models/Services');
const Transactions = require('../../models/Transaction');
const Banners = require('../../models/Banner');
const Categories = require('../../models/Category');
const Bookings = require('../../models/Booking');
const ContactUs = require('../../models/ContactUs');
const helper = require('../../helper');
// const auth = require('../../authCheck');
const TermsAndCondition = require('../../models/TermsAndCondition');
const nodemailer = require('nodemailer');
const auth = require('../../authCheck');
var moment = require('moment');
var ObjectId = require('mongodb').ObjectID;
var jwt = require('jsonwebtoken');
const multer = require('multer');
var fs = require('fs');
const Banner = require('../../models/Banner');
var storage = multer.diskStorage({
  destination: function (req, file, cd) {
    cd(null, './uploads');
  },
  filename: function (req, file, cd) {
    cd(null, Date.now() + '--' + file.originalname);
  },
});
var upload = multer({
  storage: storage,
}).single('image');

module.exports = function (app) {
  //---------------------------------------------------------Auth Api------------------------------------------------------>
  app.get('/', function (req, res) {
    try {
      // res.render('pages/auth/signup', { error: false, success: false });
      res.render('pages/auth/login', {
        error: null,
        success: null,
        changePassword:false
      });
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });
  app.get('/signupform', function (req, res) {
    try {
      // res.render('pages/auth/signup', { error: false, success: false });
      res.render('pages/auth/signup', {
        error: null,
        success: null,
      });
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  app.get('/login', async function (req, res) {
    const { email, password } = req.body;
    const user = await Users.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid Email or Password');
    }
  });

  app.get('/auth-forgot-password', function (req, res) {
    res.render('pages/auth/forgotPassword');
  });

  app.post('/changePassword', async function (req, res) {
    try {
      console.log(req.cookies.userId);
      let { password, cpassword, opassword } = req.body;

      if (password == cpassword) {
        // let admin = await Users.findOne({ role: 'Admin' });
        // if (opassword == admin.password) {
        const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);
          let updateAdmin = await Users.findOneAndUpdate(
            { _id: req.cookies.userId },
            { password: password }
          );
        //   console.log(updateAdmin);
          if (updateAdmin) {
            res.render('pages/auth/login', { error: false, success: false,changePassword:true });
          }
        // }
      //   if () {
          
      //   }
      else {
          let error = 'Wrong Password!';
          res.render('pages/auth/changePassword', { error: error });
        }
      } else {
        let error = 'Password and Confrim Password not Matching';
        res.render('pages/auth/changePassword', { error: error });
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  app.get('/changePasswordForm', auth, async function (req, res) {
    try {
      res.render('pages/auth/changePassword', { error: false });
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });


  app.post('/validateotp', async function (req, res) {
    try {
      // const { email } = req.body;
      console.log(req.cookies.userId)
      const user = await Users.findOne({ _id: req.cookies.userId });
      console.log(user.otp);
      if (req.body.otp != user.otp) {
        res.render('pages/auth/otp', { error: true });
      } else {
        const result = await Users.updateOne(
      { _id: req.cookies.userId },
      { $set: { otp: null } }
        );
        // res.cookie('userId', user._id);
        res.render('pages/auth/changePassword', { error: false });
      }
    } catch (error) {
      console.log(error.message);
      console.log(error.stack);
     res.render('pages/auth/error/internalError');
    }
  });


  app.post('/forgotPasswordLink', async function (req, res) {




    try {
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'nikhiltilakhara@gmail.com', // Your Gmail email address
          pass: 'aezu wsgv fsyh ltmb',  // Your Gmail password or an app-specific password
        },
      });
       req.session.user = {
        email: req.body.email,
    // Other user information...
        };
         req.session.save();
      console.log(req.session.user);
       const randomNumber = Math.floor(Math.random() * 1000000);
  const formattedRandomNumber = randomNumber.toString().padStart(6, '0');
      const otp = formattedRandomNumber;
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: '"Entree 👻" <entree@example.com>', // sender address
        to: req.body.email, // list of receivers
        subject: 'Forgot Password', // Subject line
        text: 'forgot Password', // plain text body
        html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
      });
     const user = await Users.updateOne(
      { email: req.body.email },
      { $set: { otp: otp } }
     );
      const result = await Users.findOne({ email: req.body.email });
      console.log(user)
      res.cookie('userId', result._id);
  // console.log('Message sent: %s', info.messageId);
  // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

  res.render('pages/auth/otp', { error: false });
    } catch (error) {
      console.log(error.message);
      console.log(error.stack);
      res.render('pages/auth/error/internalError');
    }





    // let testAccount = await nodemailer.createTestAccount();
    // let transporter = nodemailer.createTransport({
    //   host: 'smtp.ethereal.email',
    //   port: 587,
    //   secure: false, // true for 465, false for other ports
    //   auth: {
    //     user: testAccount.user, // generated ethereal user
    //     pass: testAccount.pass, // generated ethereal password
    //   },
    // });

    // // send mail with defined transport object
    // let info = await transporter.sendMail({
    //   from: '"Entree 👻" <entree@example.com>', // sender address
    //   to: req.body.email, // list of receivers
    //   subject: 'Forgot Password', // Subject line
    //   text: 'forgot Password', // plain text body
    //   html: '<b>Hello world?</b>', // html body
    // });

    // console.log('Message sent: %s', info.messageId);
    // // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    // // Preview only available when sending through an Ethereal account
    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    // res.render('pages/auth/changePassword', { error: false });
  });

  app.get('/dashboardAdminLogin', auth, async function (req, res) {
    try {
      const users = await Users.find();
      const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });
      const recipies = await Recipes.find();
      const transactions = await Transactions.find();
      const userCount = users.filter((user) => {
        if (user.role !== 'Admin') {
          return user;
        }
      });
      const videoCount = recipies.filter((recipe) => {
        if (recipe.fileType == 'video') {
          return recipe;
        }
      });
      const transactionCount = transactions.filter((transaction) => {
        if (transaction.status == 'done') {
          return transaction;
        }
      });
      res.render('pages/dashboard', { admin });
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  app.post('/dashboard-adminLogin', async function (req, res) {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ email });
      if (user && (await user.matchPassword(password))) {
        // res.json({
        //   _id: user._id,
        //   name: user.name,
        //   email: user.email,
        //   pic: user.pic,
        //   token: generateToken(user._id),
        // });
        const id = user._id;
        const accessToken = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET);
        req.session.user = {
        email: email,
    // Other user information...
        };
         req.session.save();
        res.cookie('accesstoken', accessToken, { httpOnly: true });
        res.cookie('userId', user._id);
        res.render('pages/dashboard', { user });
      } else {
        res.status(401);
        throw new Error('Invalid Email or Password');
      }
      // const recipies = await Recipes.find();
      // const admin = await Users.findOne({ _id: "63047b5c8cc7520f6d161eda" });
      // const transactions = await Transactions.find();
      // const userCount = users.filter((user) => {
      //     if (user.role !== "Admin") {
      //         return user;
      //     }
      // })
      // const videoCount = recipies.filter((recipe) => {
      //     if (recipe.fileType == "video") {
      //         return recipe;
      //     }
      // })
      // const transactionCount = transactions.filter((transaction) => {
      //     if (transaction.status == "done") {
      //         return transaction;
      //     }
      // })
      // const count = {
      //     user: userCount.length,
      //     video: videoCount.length,
      //     transaction: transactionCount.length,
      // }
      // let user = await Users.findOne({ email: email });
      // const checkPassword = await helper.comparePass(password, user.password);
      // if (user && user.role == 'Admin' && checkPassword) {
      //   const user = { name: 'admin' };
      //   const accesstoken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
      //   res.cookie('accesstoken', accesstoken);
      //   res.render('pages/dashboard', { user });
      // } else {
      //   let error = 'Wrong Credentials.';
      //   res.render('pages/auth/login', { error: error, success: false });
      // }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });
  app.post('/register', async function (req, res) {
    try {
      console.log(req.body);
      const user = await Users.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        role: req.body.role,
      });

      // Consider redirecting to a success page or sending a success message
      res.render('pages/auth/login', {
        error: null,
        success: 'Now You can login',
        changePassword:false
      });
    } catch (e) {
      console.error(e.message);
      console.error(e.stack);

      // Pass an error message to the error page
      res.render('pages/auth/error/internalError', {
        errorMessage: 'Internal server error. Please try again later.',
      });
      res.send('jdg');
    }
  });

  //---------------------------------------------------------Recipes Api------------------------------------------------------>
  //recipe table
  app.get('/recipes', auth, async function (req, res) {
    try {
      const successmessage = req.flash('successmsg');
      const tags = await Tags.find();
      const errmessage = req.flash('errmsg');
      const recipesList = await Recipes.find();
      const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });
      res.render('pages/recipes/recipes', {
        successmessage,
        errmessage,
        recipesList,
        tags,
        admin,
      });
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //save recipes
  app.post('/saveRecipe', auth, upload, async function (req, res) {
    try {
      const { name, creatorName, tags, status, description, ingredients } =
        req.body;
      if (name.trim() == '') {
        req.flash('errmsg', 'Food name must be valid');
        res.redirect('/addRecipes');
        return;
      }
      if (creatorName.trim() == '') {
        req.flash('errmsg', ' Creator name must be valid');
        res.redirect('/addRecipes');
        return;
      }
      if (req.file) {
        const file = req.file.filename;
        const fileType = req.file.mimetype.split('/')[0];
        if (fileType == 'video') {
          if (
            !!name &&
            !!creatorName &&
            !!tags &&
            !!status &&
            !!description &&
            !!file
          ) {
            let saveRecipes = await Recipes.create({
              name: name,
              creatorName: creatorName,
              tags: tags,
              status: status,
              description: description,
              ingredients: ingredients,
              file: file,
              fileType: fileType,
            });
            if (saveRecipes) {
              req.flash('successmsg', 'Saved Successfully');
              res.redirect('/recipes');
            }
          } else {
            req.flash('errmsg', 'All fields are required');
            res.redirect('/addRecipes');
          }
        } else {
          req.flash('errmsg', 'Video must be valid !');
          res.redirect('/addRecipes');
        }
      } else {
        req.flash('errmsg', 'Videeo is required!');
        res.redirect('/addRecipes');
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
     res.render('pages/auth/error/internalError');
    }
  });

  //delete recipes
  app.get('/deleteRecipe', auth, async function (req, res) {
    try {
      const id = req.query.id;
      let recipeDetail = await Recipes.findOne({ _id: id });
      if (recipeDetail) {
        fs.unlinkSync('./uploads/' + recipeDetail.file, (err) => {
          if (err) throw err;
          console.log('test1.txt was deleted');
        });
      }
      let recipe = await Recipes.deleteOne({ _id: ObjectId(id) });
      if (recipe) {
        req.flash('successmsg', 'Deleted Successfully');
        res.redirect('/recipes');
      } else {
        req.flash('errmsg', 'Try Again');
        res.redirect('/recipes');
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
     res.render('pages/auth/error/internalError');
    }
  });

  //add recipe form
  app.get('/addRecipes', auth, async function (req, res) {
    try {
      const successmessage = req.flash('successmsg');
      const errmessage = req.flash('errmsg');
      const tags = await Tags.find();
      const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });
      res.render('pages/recipes/add', {
        successmessage,
        errmessage,
        tags,
        admin,
      });
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //Edit recipe form
  app.get('/editRecipe', auth, async function (req, res) {
    try {
      const successmessage = req.flash('successmsg');
      const errmessage = req.flash('errmsg');
      const tags = await Tags.find();
      const id = req.query.id;
      const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });
      const recipe = await Recipes.findOne({ _id: id });
      if (recipe) {
        res.render('pages/recipes/edit', {
          recipe,
          successmessage,
          errmessage,
          tags,
          admin,
        });
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //update recipe
  app.post('/updateRecipe', auth, upload, async function (req, res) {
    try {
      const {
        name,
        creatorName,
        tags,
        status,
        description,
        old_image,
        old_fileType,
        ingredients,
        id,
      } = req.body;
      if (name.trim() == '') {
        req.flash('errmsg', 'Food name must be valid');
        res.redirect('/editRecipe?id=' + id);
        return;
      }
      if (creatorName.trim() == '') {
        req.flash('errmsg', ' Creator name must be valid');
        res.redirect('/editRecipe?id=' + id);
        return;
      }
      var new_image = '';
      var fileType = '';
      if (req.file) {
        new_image = req.file.filename;
        fileType = req.file.mimetype.split('/')[0];
        if (fileType == 'video') {
          fs.unlinkSync('./uploads/' + old_image);
        }
      } else {
        new_image = old_image;
        fileType = old_fileType;
      }
      if (fileType == 'video') {
        if (
          !!name &&
          !!creatorName &&
          !!tags &&
          !!status &&
          !!description &&
          !!new_image &&
          !!fileType &&
          !!ingredients
        ) {
          let updateRecipes = await Recipes.findOneAndUpdate(
            { _id: id },
            {
              name: name,
              creatorName: creatorName,
              tags: tags,
              status: status,
              description: description,
              file: new_image,
              ingredients: ingredients,
              fileType: fileType,
            }
          );
          if (updateRecipes) {
            req.flash('successmsg', 'Updated Successfully');
            res.redirect('/recipes');
          }
        } else {
          req.flash('errmsg', 'All fields are required');
          res.redirect('/editRecipe?id=' + id);
        }
      } else {
        req.flash('errmsg', 'Video must be valid!');
        res.redirect('/editRecipe?id=' + id);
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
     res.render('pages/auth/error/internalError');
    }
  });

  //show recipe Details
  app.get('/recipeDetails', auth, async function (req, res) {
    try {
      const id = req.query.id;
      const recipe = await Recipes.findOne({ _id: id });
      const successmessage = req.flash('successmsg');
      const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });
      const errmessage = req.flash('errmsg');
      res.render('pages/recipes/show', {
        successmessage,
        errmessage,
        recipe,
        admin,
      });
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //download recipe Details
  app.get('/recipeDownload', auth, async function (req, res) {
    try {
      const video = req.query.video;
      res.download('./uploads/' + video);
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
     res.render('pages/auth/error/internalError');
    }
  });

  //---------------------------------------------Users Api----------------------------------------------------------->
  //user table
  app.get('/users', auth, async function (req, res) {
    try {
      const successmessage = req.flash('successmsg');
      const errmessage = req.flash('errmsg');
      const users = await Users.find();
      const usersList = users.filter((user) => {
        if (user.role == 'Users') {
          return user;
        }
      });
      const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });

      res.render('pages/users/users', {
        successmessage,
        errmessage,
        usersList,
        admin,
      });
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //show user Profile
  app.get('/userProfile', auth, async function (req, res) {
    try {
      const id = req.query.id;
      const user = await Users.findOne({ _id: id });
      const successmessage = req.flash('successmsg');
      const errmessage = req.flash('errmsg');
      const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });

      res.render('pages/users/show', {
        successmessage,
        errmessage,
        user,
        admin,
      });
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //add user form
  app.get('/addUser', auth, async function (req, res) {
    try {
      const successmessage = req.flash('successmsg');
      const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });
      const errmessage = req.flash('errmsg');
      res.render('pages/users/add', { successmessage, errmessage, admin });
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  // save user
  app.post('/saveUser', auth, upload, async function (req, res) {
    try {
      const { name, email, password, phoneNumber, description } = req.body;
      if (name.trim() == '') {
        req.flash('errmsg', 'Users name must be valid');
        res.redirect('/addUser');
      }
      if (req.image) {
        const image = req.image.filename;
        const fileType = req.image.mimetype.split('/')[0];
        if (fileType == 'image') {
          if (
            !!name &&
            !!email &&
            !!password &&
            !!phoneNumber &&
            !!image &&
            !!description
          ) {
            let saveUser = await Users.create({
              name: name,
              email: email,
              password: password,
              phoneNumber: phoneNumber,
              role: 'Users',
              image: image,
              description: description,
            });
            if (saveUser) {
              req.flash('successmsg', 'Saved Successfully');
              res.redirect('/users');
            }
          } else {
            req.flash('errmsg', 'All fields are required');
            res.redirect('/addUser');
          }
        } else {
          req.flash('errmsg', 'Image must be valid !');
          res.redirect('/addUser');
        }
      } else {
        req.flash('errmsg', 'Image must be required !');
        res.redirect('/addUser');
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
     res.render('pages/auth/error/internalError');
    }
  });

  //delete users
  app.get('/deleteUser', auth, async function (req, res) {
    try {
      const id = req.query.id;
      let userDetail = await Users.findOne({ _id: id });
      if (userDetail) {
        fs.unlinkSync('./uploads/' + userDetail.file);
      }
      let user = await Users.deleteOne({ _id: ObjectId(id) });
      if (user) {
        req.flash('successmsg', 'Deleted Successfully');
        res.redirect('/users');
      } else {
        req.flash('errmsg', 'Try Again');
        res.redirect('/users');
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //Edit user form
  app.get('/editUser', auth, async function (req, res) {
    try {
      const successmessage = req.flash('successmsg');
      const errmessage = req.flash('errmsg');
      const id = req.query.id;
      const user = await Users.findOne({ _id: id });
      const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });

      if (user) {
        res.render('pages/users/edit', {
          successmessage,
          errmessage,
          user,
          admin,
        });
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //update user
  app.post('/updateUser', auth, upload, async function (req, res) {
    try {
      const {
        name,
        email,
        password,
        phoneNumber,
        old_image,
        old_fileType,
        description,
        id,
      } = req.body;
      if (name.trim() == '') {
        req.flash('errmsg', 'Users name must be valid');
        res.redirect('/editUser?id=' + id);
      }
      var new_image = '';
      var fileType = '';
      if (req.file) {
        new_image = req.file.filename;
        fileType = req.file.mimetype.split('/')[0];
        if (fileType == 'image') {
          fs.unlinkSync('./uploads/' + old_image);
        }
      } else {
        new_image = old_image;
        fileType = old_fileType;
      }
      if (fileType == 'image') {
        if (
          !!name &&
          !!email &&
          !!password &&
          !!phoneNumber &&
          !!new_image &&
          !!fileType &&
          !!description
        ) {
          let updateUser = await Users.findOneAndUpdate(
            { _id: id },
            {
              name: name,
              email: email,
              password: password,
              phoneNumber: phoneNumber,
              file: new_image,
              description: description,
              fileType: fileType,
            }
          );
          if (updateUser) {
            req.flash('successmsg', 'Updated Successfully');
            res.redirect('/users');
          }
        } else {
          req.flash('errmsg', 'All fields are required');
          res.redirect('/editUser?id=' + id);
        }
      } else {
        req.flash('errmsg', 'Image must be valid !');
        res.redirect('/editUser?id=' + id);
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //admin profile
  app.get('/adminProfile', auth, async function (req, res) {
    try {
      const successmessage = req.flash('successmsg');
      const errmessage = req.flash('errmsg');
      let user = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });
      const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });
      if (user) {
        res.render('pages/adminProfile', {
          successmessage,
          errmessage,
          user: user,
          admin,
        });
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //update admin profile
  app.post('/updateAdminProfile', auth, upload, async function (req, res) {
    try {
      const { uname, oldfile } = req.body;
      var new_image = '';
      var fileType = '';
      if (req.file) {
        new_image = req.file.filename;
        fileType = req.file.mimetype.split('/')[0];
      } else {
        new_image = oldfile;
        fileType = 'image';
      }

      if (fileType == 'image') {
        let updateUser = await Users.findOneAndUpdate(
          { _id: '63047b5c8cc7520f6d161eda' },
          {
            name: uname,
            file: new_image,
          }
        );
        if (updateUser) {
          req.flash('successmsg', 'Updated Successfully');
          res.redirect('/adminProfile');
        }
      } else {
        req.flash('errmsg', 'Image must be valid !');
        res.redirect('/adminProfile');
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
     res.render('pages/auth/error/internalError');
    }
  });

  //---------------------------------------------Tags Api----------------------------------------------------------->
  //tags table
  app.get('/tags', auth, async function (req, res) {
    try {
      const successmessage = req.flash('successmsg');
      const errmessage = req.flash('errmsg');
      const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });
      const tagsList = await Tags.find();
      res.render('pages/tags/tags', {
        successmessage,
        errmessage,
        tagsList,
        admin,
      });
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //add tag form
  app.get('/addTag', auth, async function (req, res) {
    try {
      const successmessage = req.flash('successmsg');
      const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });
      const errmessage = req.flash('errmsg');
      res.render('pages/tags/add', { successmessage, errmessage, admin });
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  // save tag
  app.post('/saveTag', auth, async function (req, res) {
    try {
      const { tagName, status } = req.body;
      if (tagName.trim() == '') {
        req.flash('errmsg', 'Tag name must be valid');
        res.redirect('/addTag');
      }
      if (!!tagName && !!status) {
        let saveTag = await Tags.create({
          tagName: tagName,
          status: status,
        });
        if (saveTag) {
          req.flash('successmsg', 'Saved Successfully');
          res.redirect('/tags');
        }
      } else {
        req.flash('errmsg', 'All fields are required');
        res.redirect('/addTag');
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
     res.render('pages/auth/error/internalError');
    }
  });

  //delete tag
  app.get('/deleteTag', auth, async function (req, res) {
    try {
      const id = req.query.id;
      let tag = await Tags.deleteOne({ _id: ObjectId(id) });
      if (tag) {
        req.flash('successmsg', 'Deleted Successsfully');
        res.redirect('/tags');
      } else {
        req.flash('errmsg', 'Try Again');
        res.redirect('/tags');
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //Edit tag form
  app.get('/editTag', auth, async function (req, res) {
    try {
      const successmessage = req.flash('successmsg');
      const errmessage = req.flash('errmsg');
      const id = req.query.id;
      const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });
      const tag = await Tags.findOne({ _id: id });
      if (tag) {
        res.render('pages/tags/edit', {
          successmessage,
          errmessage,
          tag,
          admin,
        });
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //update tag
  app.post('/updateTag', auth, async function (req, res) {
    try {
      const { tagName, status, id } = req.body;
      if (tagName.trim() == '') {
        req.flash('errmsg', 'Tag name must be valid');
        res.redirect('/editTag?id=' + id);
      }
      if (!!tagName && !!status) {
        let exist = await Tags.findOne({ _id: id });
        if (exist) {
          let updateTag = await Tags.findOneAndUpdate(
            { _id: id },
            {
              tagName: tagName,
              status: status,
            }
          );
          if (updateTag) {
            req.flash('successmsg', 'Updated Successfully');
            res.redirect('/tags');
          }
        } else {
          req.flash('errmsg', 'This tag not exist');
          res.redirect('/editTag');
        }
      } else {
        req.flash('errmsg', 'All fields are required');
        res.redirect('/editTag?id=' + id);
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //---------------------------------------------Reports Api----------------------------------------------------------->
  //tags table
  app.get('/reports', auth, async function (req, res) {
    try {
      const successmessage = req.flash('successmsg');
      const errmessage = req.flash('errmsg');
      const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });
      const reportsList = await Reports.find();
      res.render('pages/reports/reports', {
        successmessage,
        errmessage,
        reportsList,
        admin,
      });
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //show report
  app.get('/reportDetails', auth, async function (req, res) {
    try {
      const id = req.query.id;
      const report = await Reports.findOne({ _id: id });
      const successmessage = req.flash('successmsg');
      const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });
      const errmessage = req.flash('errmsg');
      res.render('pages/reports/show', {
        successmessage,
        errmessage,
        report,
        admin,
      });
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //delete tag
  app.get('/deleteReport', auth, async function (req, res) {
    try {
      const id = req.query.id;
      let report = await Reports.deleteOne({ _id: ObjectId(id) });
      if (report) {
        req.flash('successmsg', 'Deleted Successsfully');
        res.redirect('/reports');
      } else {
        req.flash('errmsg', 'Try Again');
        res.redirect('/reports');
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //---------------------------------------------Priavate Policy Api----------------------------------------------------------->
  //Priavate Policy From
  app.get('/privatePolicy', auth, async function (req, res) {
    try {
      const successmessage = req.flash('successmsg');
      const errmessage = req.flash('errmsg');
      const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });
      let privatePolicy = await PrivatePolicy.find();
      if (privatePolicy.length > 0) {
        res.render('pages/privacyPolicy', {
          successmessage,
          errmessage,
          privatePolicy,
          admin,
        });
      } else {
        privatePolicy = {
          policy: '',
        };
        res.render('pages/privacyPolicy', {
          successmessage,
          errmessage,
          privatePolicy,
          admin,
        });
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //save policy
  app.post('/savePolicy', auth, async function (req, res) {
    try {
      const { policy } = req.body;
      let privatePolicy = await PrivatePolicy.find();
      if (privatePolicy.length > 0) {
        let updatePolicy = await PrivatePolicy.findOneAndUpdate(
          { _id: privatePolicy[0]._id },
          {
            policy: policy,
          }
        );
        if (updatePolicy) {
          req.flash('successmsg', 'Updated Successfully');
          res.redirect('/privatePolicy');
        }
      } else {
        if (!!policy) {
          let savePolicy = await PrivatePolicy.create({
            policy: policy,
          });
          if (savePolicy) {
            req.flash('successmsg', 'Saved Successsfully');
            res.redirect('/privatePolicy');
          }
        } else {
          req.flash('errmsg', 'policy field required');
          res.redirect('/privatePolicy');
        }
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //---------------------------------------------Term and condition Api----------------------------------------------------------->
  //Terms And Condition From
  app.get('/termsAndCondition', auth, async function (req, res) {
    try {
      const successmessage = req.flash('successmsg');
      const errmessage = req.flash('errmsg');
      const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });
      let termsAndCondition = await TermsAndCondition.find();
      if (termsAndCondition.length > 0) {
        res.render('pages/termsAndCondition', {
          successmessage,
          errmessage,
          termsAndCondition,
          admin,
        });
      } else {
        let termsAndCondition = {
          termsAndCondition: '',
        };
        res.render('pages/termsAndCondition', {
          successmessage,
          errmessage,
          termsAndCondition,
          admin,
        });
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //save policy
  app.post('/saveTermsAndCondition', auth, async function (req, res) {
    try {
      const { termsAndCondition } = req.body;
      let contactUs = await TermsAndCondition.find();
      if (contactUs.length > 0) {
        let updatetermsAndCondition = await TermsAndCondition.findOneAndUpdate(
          { _id: contactUs[0]._id },
          {
            termsAndCondition: termsAndCondition,
          }
        );
        if (updatetermsAndCondition) {
          req.flash('successmsg', 'Updated Successfully');
          res.redirect('/termsAndCondition');
        }
      } else {
        if (!!termsAndCondition) {
          let saveTermsAndCondition = await TermsAndCondition.create({
            termsAndCondition: termsAndCondition,
          });
          if (saveTermsAndCondition) {
            req.flash('successmsg', 'Saved Successsfully');
            res.redirect('/termsAndCondition');
          }
        } else {
          req.flash('errmsg', 'termsAndCondition field required');
          res.redirect('/termsAndCondition');
        }
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //-------------------------------- transaction ID ------------------------------------>
  app.get('/transactions', auth, async function (req, res) {
    try {
      let transactionList = await Transactions.find();
      const successmessage = req.flash('successmsg');
      const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });
      const errmessage = req.flash('errmsg');
      res.render('pages/transaction', {
        transactionList,
        successmessage,
        errmessage,
        moment: moment,
        admin,
      });
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //delete transactions
  app.get('/deleteTransaction', auth, async function (req, res) {
    try {
      const id = req.query.id;
      let transaction = await Transactions.deleteOne({ _id: ObjectId(id) });
      if (transaction) {
        req.flash('successmsg', 'Deleted Successsfully');
        res.redirect('/transactions');
      } else {
        req.flash('errmsg', 'Try Again');
        res.redirect('/transactions');
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //-----------------------------------Contact us------------------------------------------------------>
  //contact Us From
  app.get('/contactUs', auth, async function (req, res) {
    try {
      const successmessage = req.flash('successmsg');
      const errmessage = req.flash('errmsg');
      const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });
      let contactUs = await ContactUs.find();
      if (contactUs.length > 0) {
        res.render('pages/contactUs', {
          successmessage,
          errmessage,
          contactUs,
          admin,
        });
      } else {
        let contactUs = [{ number: '' }];
        res.render('pages/contactUs', {
          successmessage,
          errmessage,
          contactUs,
          admin,
        });
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
     res.render('pages/auth/error/internalError');
    }
  });

  //save contact us
  app.post('/saveContactUs', auth, async function (req, res) {
    try {
      const { number, email, address } = req.body;
      let contactUs = await ContactUs.find();
      if (contactUs.length > 0) {
        let updateContactUs = await ContactUs.findOneAndUpdate(
          { _id: contactUs[0]._id },
          {
            number: number,
            email: email,
            address: address,
          }
        );
        if (updateContactUs) {
          req.flash('successmsg', 'Updated Successfully');
          res.redirect('/contactUs');
        }
      } else {
        if (!!contactUs) {
          let saveContactUs = await ContactUs.create({
            number: number,
            email: email,
            address: address,
          });
          if (saveContactUs) {
            req.flash('successmsg', 'Saved Successsfully');
            res.redirect('/contactUs');
          }
        } else {
          req.flash('errmsg', 'conatact field required');
          res.redirect('/contactUs');
        }
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //-----------------------------------------------------logout---------------------------------------------->
  app.get('/logout', auth, async function (req, res) {
    res.clearCookie('accesstoken');
    res.redirect('/');
  });

  //------------------------------------------------------update status---------------------------------------->
  app.post('/updateStatus', auth, async function (req, res) {
    try {
      const { id, list, status } = req.body;
      if (list == 'tag') {
        let updatedStatus = '';
        if (status == 'Active') {
          updatedStatus = 'Inactive';
        } else {
          updatedStatus = 'Active';
        }
        let tag = await Tags.findOneAndUpdate(
          { _id: id },
          { status: updatedStatus }
        );
        if (tag) {
          res.send('success');
        }
      }
      if (list == 'recipe') {
        let updatedStatus = '';
        if (status == 'Active') {
          updatedStatus = 'Inactive';
        } else {
          updatedStatus = 'Active';
        }
        let recipe = await Recipes.findOneAndUpdate(
          { _id: id },
          { status: updatedStatus }
        );
        if (recipe) {
          res.send('success');
        }
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  app.post('/searchTag', auth, async function (req, res) {
    try {
      const { search } = req.body;
      const successmessage = req.flash('successmsg');
      const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });
      const errmessage = req.flash('errmsg');
      let tagsList = await Tags.find({
        tagName: { $regex: search, $options: 'i' },
      });
      if (tagsList) {
        res.render('pages/tags/tags', {
          successmessage,
          errmessage,
          tagsList,
          admin,
        });
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  app.post('/searchRecipe', auth, async function (req, res) {
    try {
      const { search } = req.body;
      if (search.trim() != '') {
        const successmessage = req.flash('successmsg');
        const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });
        const errmessage = req.flash('errmsg');
        const tags = Tags.find();
        let recipesList = await Recipes.find({
          name: { $regex: search, $options: 'i' },
        });
        res.render('pages/recipes/recipes', {
          successmessage,
          errmessage,
          recipesList,
          tags,
          admin,
        });
      } else {
        res.redirect('/recipes');
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  app.post('/searchUser', auth, async function (req, res) {
    try {
      const { search } = req.body;
      if (search.trim() != '') {
        const successmessage = req.flash('successmsg');
        const errmessage = req.flash('errmsg');
        let usersList = await Users.find({
          name: { $regex: search.trim(), $options: 'i' },
        });
        res.render('pages/users/users', {
          successmessage,
          errmessage,
          usersList,
        });
      } else {
        res.redirect('/users');
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  app.post('/signUp', async function (req, res) {
    console.log(req.body);
    let v = new Validator(req.body, {
      name: 'required',
      email: 'required',
      countryCode: 'required',
      password: 'required',
      phoneNumber: 'required',
    });

    var errorsResponse;
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
      return helper.failed(res, errorsResponse);
    }

    //-----------CHECK IF EMAIL EXISTS----------------------

    let { name, email, countryCode, password, phoneNumber } = req.body;
    let checkEmail = await Users.findOne({ email: email });

    console.log(checkEmail, 'checkEmail');

    if (checkEmail > 0) {
      return helper.failed(res, 'Email already exists. Please use another.');
    }
  });

  //-------------------------------- category ID ------------------------------------>
  app.get('/category', auth, async function (req, res) {
    try {
      let catgoriesList = await Categories.find();
      const successmessage = req.flash('successmsg');
      // const admin = await Users.findOne({ _id: "63047b5c8cc7520f6d161eda" });
      const errmessage = req.flash('errmsg');
      res.render('pages/category/category', {
        catgoriesList,
        successmessage,
        errmessage,
        moment: moment,
      });
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //add category form
  app.get('/addCategory', auth, async function (req, res) {
    try {
      const successmessage = req.flash('successmsg');
      const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });
      const errmessage = req.flash('errmsg');
      const CategoriesList = await Categories.find();
      res.render('pages/category/add', {
        CategoriesList,
        successmessage,
        errmessage,
        admin,
      });
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  // save category
  app.post('/saveCategory', auth, async function (req, res) {
    try {
      const successmessage = req.flash('successmsg');
      const errmessage = req.flash('errmsg');
      let request = req.body;
      let exist = await Categories.findOne({ name: req.name });
      if (exist) {
        if (exist.created_by_user_id == req.body.created_by_user_id) {
          return res
            .status(200)
            .send({ message: 'This name is already exists!' });
        }
      }
      let parentExit = await Categories.findOne({ name: request.parent });
      if (parentExit) {
        request.parentCount = parentExit?.parentCount + 1;
        request.branch = [parentExit?.name, ...parentExit?.branch];
      } else {
        request.parentCount = 0;
        request.branch = [];
      }
      let saveCategory = await Categories.create(request);
      if (saveCategory) {
        req.flash('successmsg', 'Saved Successfully');
        res.redirect('/category');
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  // delete category
  app.get('/deleteCategory', auth, async function (req, res) {
    try {
      const id = req.query.id;
      let category = await Categories.deleteOne({ _id: ObjectId(id) });
      if (category) {
        req.flash('successmsg', 'Deleted Successsfully');
        res.redirect('/category');
      } else {
        req.flash('errmsg', 'Try Again');
        res.redirect('/category');
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //-------------------------------- services ID------------------------------------>
  app.get('/service', auth, async function (req, res) {
    try {
      let servicesList = await Services.find();
      const successmessage = req.flash('successmsg');
      // const admin = await Users.findOne({ _id: "63047b5c8cc7520f6d161eda" });
      const errmessage = req.flash('errmsg');
      res.render('pages/services/services', {
        servicesList,
        successmessage,
        errmessage,
        moment: moment,
      });
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //add services form
  app.get('/addServices', auth, async function (req, res) {
    try {
      const successmessage = req.flash('successmsg');
      const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });
      const errmessage = req.flash('errmsg');
      res.render('pages/services/add', { successmessage, errmessage, admin });
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
     res.render('pages/auth/error/internalError');
    }
  });

  //save services form
  app.post('/saveService', auth, async function (req, res) {
    try {
      let request = req.body;
      let exist = await Services.findOne({ title: req.title });
      if (exist) {
        if (exist.created_by_user_id == req.body.created_by_user_id) {
          return res
            .status(200)
            .send({ message: 'This title is already exists!' });
        }
      }
      let saveServices = await Services.create(request);
      if (saveServices) {
        req.flash('successmsg', 'Saved Successsfully');
        res.redirect('/service');
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  // delete service
  app.get('/deleteService', auth, async function (req, res) {
    try {
      const id = req.query.id;
      let service = await Services.deleteOne({ _id: ObjectId(id) });
      if (service) {
        req.flash('successmsg', 'Deleted Successsfully');
        res.redirect('/service');
      } else {
        req.flash('errmsg', 'Try Again');
        res.redirect('/service');
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //Edit service form
  app.get('/editService', auth, async function (req, res) {
    try {
      const successmessage = req.flash('successmsg');
      const errmessage = req.flash('errmsg');
      const id = req.query.id;
      const service = await Services.findOne({ _id: id });
      if (service) {
        res.render('pages/services/edit', {
          successmessage,
          errmessage,
          service,
        });
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
     res.render('pages/auth/error/internalError');
    }
  });

  //update service
  app.post('/updateService', auth, async function (req, res) {
    try {
      const { title, description, serviceType, amount, serviceTime, id } =
        req.body;
      if (title.trim() == '') {
        req.flash('errmsg', 'title name must be valid');
        res.redirect('/editService?id=' + id);
      }
      if (
        !!title &&
        !!description &&
        !!serviceTime &&
        !!serviceType &&
        !!amount
      ) {
        let exist = await Services.findOne({ _id: id });
        if (exist) {
          let updateService = await Services.findOneAndUpdate(
            { _id: id },
            {
              title: title,
              description: description,
              serviceTime: serviceTime,
              serviceType: serviceType,
              amount: amount,
            }
          );
          if (updateService) {
            req.flash('successmsg', 'Updated Successfully');
            res.redirect('/service');
          }
        } else {
          req.flash('errmsg', 'This tag not exist');
          res.redirect('/editService?id=' + id);
        }
      } else {
        req.flash('errmsg', 'All fields are required');
        res.redirect('/editService?id=' + id);
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //-------banner page-------------------//
  app.get('/banner', auth, upload, async function (req, res) {
    try {
      let bannerList = await Banners.find();
      const successmessage = req.flash('successmsg');
      // const admin = await Users.findOne({ _id: "63047b5c8cc7520f6d161eda" });
      const errmessage = req.flash('errmsg');
      if (bannerList.length > 0) {
        res.render('pages/banner/show', {
          bannerList,
          successmessage,
          errmessage,
        });
      } else {
        res.render('pages/banner/add', {
          bannerList,
          successmessage,
          errmessage,
        });
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //save banner
  app.post('/saveBanner', auth, upload, async function (req, res) {
    try {
      const file = req.file.filename;
      let bannerList = await Banners.find();
      if (!!file) {
        if (bannerList.length > 0) {
          let updateBanner = await Banners.findOneAndUpdate(
            { _id: bannerList[0]._id },
            {
              image: file,
            }
          );
          if (updateBanner) {
            req.flash('successmsg', 'Updated Successfully');
            res.redirect('/banner');
          }
        } else {
          let saveBanner = await Banners.create({
            image: file,
          });
          if (saveBanner) {
            req.flash('successmsg', 'Saved Successfully');
            res.redirect('/banner');
          }
        }
      } else {
        req.flash('errmsg', 'All fields are required');
        res.redirect('/banner');
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //-------banner page-------------------//
  app.get('/editBanner', auth, upload, async function (req, res) {
    try {
      let bannerList = await Banners.find();
      const successmessage = req.flash('successmsg');
      // const admin = await Users.findOne({ _id: "63047b5c8cc7520f6d161eda" });
      const errmessage = req.flash('errmsg');
      res.render('pages/banner/edit', {
        bannerList,
        successmessage,
        errmessage,
      });
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //--------------------------------bookings ID------------------------------------>
  app.get('/booking', auth, async function (req, res) {
    try {
      let bookingsList = await Bookings.find();
      let servicesList = await Services.find();
      const successmessage = req.flash('successmsg');
      // const admin = await Users.findOne({ _id: "63047b5c8cc7520f6d161eda" });
      const errmessage = req.flash('errmsg');
      res.render('pages/booking/booking', {
        bookingsList,
        servicesList,
        successmessage,
        errmessage,
        moment: moment,
      });
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //add booking form
  app.get('/addBooking', auth, async function (req, res) {
    try {
      const successmessage = req.flash('successmsg');
      const admin = await Users.findOne({ _id: '63047b5c8cc7520f6d161eda' });
      const servicesList = await Services.find({});
      const errmessage = req.flash('errmsg');
      res.render('pages/booking/add', {
        servicesList,
        successmessage,
        errmessage,
        admin,
      });
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //save services form
  app.post('/saveBooking', auth, async function (req, res) {
    try {
      let request = req.body;
      let saveBooking = await Bookings.create(request);
      if (saveBooking) {
        req.flash('successmsg', 'Saved Successsfully');
        res.redirect('/booking');
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  // delete booking
  app.get('/deleteBooking', auth, async function (req, res) {
    try {
      const id = req.query.id;
      let service = await Bookings.deleteOne({ _id: ObjectId(id) });
      if (service) {
        req.flash('successmsg', 'Deleted Successsfully');
        res.redirect('/booking');
      } else {
        req.flash('errmsg', 'Try Again');
        res.redirect('/booking');
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
     res.render('pages/auth/error/internalError');
    }
  });

  //Edit booking form
  app.get('/editBooking', auth, async function (req, res) {
    try {
      const successmessage = req.flash('successmsg');
      const errmessage = req.flash('errmsg');
      const servicesList = await Services.find({});
      const id = req.query.id;
      const booking = await Bookings.findOne({ _id: id });
      if (booking) {
        res.render('pages/booking/edit', {
          servicesList,
          successmessage,
          errmessage,
          booking,
        });
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  //update service
  app.post('/updateBooking', auth, async function (req, res) {
    try {
      const { startTime, endTime, date, service, id } = req.body;
      if (!!startTime && !!endTime && !!date && !!service) {
        let exist = await Bookings.findOne({ _id: id });
        if (exist) {
          let updateBooking = await Bookings.findOneAndUpdate(
            { _id: id },
            {
              startTime: startTime,
              endTime: endTime,
              date: date,
              service: service,
            }
          );
          if (updateBooking) {
            req.flash('successmsg', 'Updated Successfully');
            res.redirect('/booking');
          }
        } else {
          req.flash('errmsg', 'This tag not exist');
          res.redirect('/editBooking?id=' + id);
        }
      } else {
        req.flash('errmsg', 'All fields are required');
        res.redirect('/editService?id=' + id);
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
     res.render('pages/auth/error/internalError');
    }
  });

  app.get('/getCategories', auth, async function (req, res) {
    try {
      let Category = (await Categories.find({})).filter(
        (item) => item.parentCount == 0
      );
      if (Category.length > 0) {
        return res.status('200').json({
          success: '1',
          code: 200,
          message: 'SubCategories',
          body: Category,
        });
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  app.post('/getSubCategoryOfCategory', auth, async function (req, res) {
    try {
      let SubCategories = await Categories.find({ parent: req.body.category });
      if (SubCategories.length > 0) {
        return res.status(200).json({
          success: '1',
          code: 200,
          message: 'SubCategories',
          body: SubCategories,
        });
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  app.get('/getServices', auth, async function (req, res) {
    try {
      let Service = await Services.find({});
      if (Service.length > 0) {
        return res.status('200').json({
          success: '1',
          code: 200,
          message: 'Service',
          body: Service,
        });
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });

  app.post('/getBookingOfServices', auth, async function (req, res) {
    try {
      let Booking = await Bookings.find({ service: req.body.service });
      if (Booking.length > 0) {
        return res.status(200).json({
          success: '1',
          code: 200,
          message: 'SubCategories',
          body: Booking,
        });
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });
  app.get('/getServices', auth, async function (req, res) {
    try {
      let Service = await Services.find({});
      if (Service.length > 0) {
        return res.status('200').json({
          success: '1',
          code: 200,
          message: 'Service',
          body: Service,
        });
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });
  app.get('/getBanner', auth, async function (req, res) {
    try {
      let Banner = await Banners.find({});
      if (Banner.length > 0) {
        return res.status('200').json({
          success: '1',
          code: 200,
          message: 'Service',
          body: Banner,
        });
      }
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      res.render('pages/auth/error/internalError');
    }
  });
};
