// module.exports = router;
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(express.json());
router.use(bodyParser.urlencoded({ extended: false }));
const auth = require('../../authCheck');

const multer = require('multer');
var fs = require('fs');
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

var auth_controller = require('../../controller/auth_controller');
var user_controller = require('../../controller/user_controller');
var recipes_controller = require('../../controller/recipes_controller');
var tags_controller = require('../../controller/tags_controller');
var terms_controller = require('../../controller/terms_controller');
var privacy_controller = require('../../controller/privacy_controller');
const index_controller = require('../../controller/index_controller');

//---------------------------------auth------------------------->
router.post('/sign_up',auth, auth_controller.sign_up);
router.post('/login', auth,auth_controller.user_login);
router.post('/forgot_password',auth, auth_controller.forgot_password);
router.post('/verify_otp',auth, auth_controller.verify_otp);
router.post('/change_password',auth, auth_controller.change_password);
router.get('/signout', auth, auth_controller.signout);

//------------------------------recipes------------------------->
router.get('/recipe_details', auth, recipes_controller.recipe_details);
router.get('/recipe_list', auth, recipes_controller.recipe_list);
router.post('/add_recipe', auth, upload, recipes_controller.add_recipe);

//------------------------------tags------------------------->
router.get('/tags_list', auth, tags_controller.tags_list);

//------------------------------users------------------------->
router.get('/users_list', user_controller.users_list);
router.get('/get_profile', user_controller.get_profile);
router.post('/add_friend', user_controller.add_friend);

//------------------------------trems and policy------------------------->
router.get('/terms_and_condition', auth, terms_controller.terms_and_condition);
router.get('/privacy_policy', auth, privacy_controller.privacy_policy);

module.exports = router;
