const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const dashboard = require('../../controllers/management/dashboard');
const validator = require('../../middlewares/validator')
const validate = require('../../middlewares/validate')


//DASHBOARD ROUTER
router.get('/dashboard', dashboard.getDashboard)
router.get('/dashboardstepform', dashboard.dashboardStepForm)

module.exports = router;