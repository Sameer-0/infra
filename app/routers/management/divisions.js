const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const divisionBatch = require('../../controllers/management/divisionBatch')
const division = require('../../controllers/management/division')
const validator =  require('../../middlewares/validator')
const validate = require('../../middlewares/validate')

//DIVISION ROUTER
router.get('/divisions', division.getPage)
router.post('/divisionscreate/create', validate('JsonValidator'), division.addDivision)
router.post('/divisions/findone', division.getDivisionById)
router.post('/divisions/update', validate('JsonValidator'), division.updateDivisionById)
router.post('/divisions/delete', validate('delete'), division.deleteDivisionById)
router.post('/divisions/search', validate('search'), division.search)


// DIVISION BATCHES
router.get('/divisions/batches', divisionBatch.getPage)
router.post('/divisions/batches/create', validate('JsonValidator'), divisionBatch.createBatch)
router.post('/division/batches/findone', divisionBatch.getBatchById)
router.post('/division/batches/update', validate('JsonValidator'), divisionBatch.updateBatchById)

module.exports = router;