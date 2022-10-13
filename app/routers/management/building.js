const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const building = require('../../controllers/management/building');
const validator =  require('../../middlewares/validator')
const validate = require('../../middlewares/validate')

// BUILDING ROUTER
router.get('/buildings', building.getPage)
router.post('/buildings/create',validate('JsonValidator'), building.create)
router.post('/buildings/update', validate('JsonValidator'), building.update)
router.post('/buildings/pagination', validate('pagination'), building.getPage)
router.post('/buildings/findone', validate('single'), building.findOne)
router.post('/buildings/search',  building.search)
router.post('/buildings/delete',  building.delete)

module.exports = router;