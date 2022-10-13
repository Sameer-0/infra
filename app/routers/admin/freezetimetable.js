const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const index =  require('../../controllers/admin/freezetimetable/index')



router.get('/freeze-time-table', index.getPage) 


module.exports = router;  