const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const session =  require('../../controllers/admin/sessions/sessions')
const types =  require('../../controllers/admin/sessions/types')
const dates =  require('../../controllers/admin/sessions/dates')
const validate = require('../../middlewares/validate')

//Session
router.get('/sessions', session.getPage) 




//Session Type
router.get('/sessions/types', types.getPage)
router.post('/sessions/types/create', validate('SessionType') , types.create)
router.post('/sessions/types/update', validate('SessionType'), types.update)
router.post('/sessions/types/delete', types.delete)
router.post('/sessions/types/findone', types.findOne)
router.post('/sessions/types/search', types.search)
router.post('/sessions/types/pagination', types.pagination)

//Session Dates
router.get('/sessions/dates', dates.getPage)
router.post('/sessions/dates/create', dates.create)
router.post('/sessions/dates/update', validate('JsonValidator'), dates.update)
router.post('/sessions/dates/delete', dates.delete)
router.post('/sessions/dates/findone', dates.findOne)
router.post('/sessions/dates/search', dates.search)
router.post('/sessions/dates/pagination', dates.pagination)
router.post('/sessions/dates/fetch-from-sap', dates.fetchFromSAP)
router.get('/sessions/dates/download', dates.downloadMaster)
router.post('/sessions/dates/show-entries', dates.showEntries)
module.exports = router;