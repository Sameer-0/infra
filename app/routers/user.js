const router = require('express').Router();
const controller = require('../controllers/user');
const {
    isLoggedIn, 
    redirectIfLoggedIn
} = require("../middlewares/user");
const {check, body, validationResult } = require('express-validator');

// router.get('/user', controller.getProfile);
router.get('/register', controller.renderRegisterPage);
router.post('/register',[check('password').isLength({ min: 8 }).withMessage('Password Must Be at Least 8 Characters')] ,controller.registerUser);

router.post('/authenticate',[
    body('email').isEmail(),
    check('username').isLength({ min: 3 }).trim().escape(),
    check('password').isLength({min: 6}).trim()], controller.authenticate);

router.get('/profile', controller.getProfile);
router.get('/login', redirectIfLoggedIn, controller.renderLoginPage);
router.get('/logout', controller.logout)

module.exports = router;