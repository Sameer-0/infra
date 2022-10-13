const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');


const holidays = require('../../controllers/admin/holidays/index')
const validate = require('../../middlewares/validate')


router.get('/holidays', holidays.getPage)
router.post('/holidays/create', validate('JsonValidator'), holidays.create)
router.post('/holidays/update', validate('JsonValidator'), holidays.update)
router.post('/holidays/delete', holidays.delete)
router.post('/holidays/findone', holidays.findOne)
router.post('/holidays/search', validate('search'), holidays.search)
router.post('/holidays/pagination', holidays.pagination)
router.post('/holidays/fetchformsap', holidays.fetchFromSAP)
router.get('/holidays/download', holidays.downloadMaster)
router.post('/holidays/show-entries',holidays.showEntries)

module.exports = router