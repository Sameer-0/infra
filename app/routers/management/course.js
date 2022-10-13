const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const courseWorkload = require('../../controllers/management/courseWorkload')
const validator =  require('../../middlewares/validator')
const validate = require('../../middlewares/validate')

//INITIAL COURSE WORKLOAD
router.get('/courseWorkload', courseWorkload.getpage)

module.exports = router;