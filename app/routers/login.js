const router = require('express').Router();
const { body } = require('express-validator');

const controller = require('../controllers/login');

router.get('/', controller.renderLoginPage);
router.post('/', body('username').escape(), controller.postLogin);


module.exports = router;