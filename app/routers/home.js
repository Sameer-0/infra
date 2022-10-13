const router = require('express').Router();
const controller = require('../controllers/home');

router.get('/', controller.renderHomePage);

module.exports = router;