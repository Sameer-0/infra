const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const holiday = require('../../controllers/management/holidays');
const holidaytype = require('../../controllers/management/holidaytypes');
const validate = require('../../middlewares/validate')


// HOLIDAY ROUTER
router.get('/holidays', holiday.getPage)
router.post('/holidays/search', holiday.search)

// HOLIDAY TYPES ROUTER
router.get('/holidays/types', holidaytype.getPage)
router.post('/holidays/types/create', validate('Holiday'), holidaytype.create)
router.post('/holidays/types/findone', validate('Holiday'), holidaytype.findOne)
router.post('/holidays/types/search', validate('search'), holidaytype.search)
router.post('/holidays/types/update', validate('Holiday'), holidaytype.update)
router.post('/holidays/types/delete', holidaytype.delete)
router.post('/holidays/types/pagination', validate('pagination'), holidaytype.pagination)
module.exports = router;