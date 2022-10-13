const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const index =  require('../../controllers/admin/timeSheet/index')



router.get('/timesheet', index.getPage) 
router.post('/timesheet/check-days-lecture', index.checkDaysLecture)
router.post('/timesheet/getSimulatedData',  index.getSimulatedData)

module.exports = router;  