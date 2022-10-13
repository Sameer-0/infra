const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const campus = require('../../controllers/management/campus');
const validator =  require('../../middlewares/validator')
const validate = require('../../middlewares/validate')

// CAMPUS ROUTER
router.get('/campuses', campus.getCampusPage)
router.post('/campuses/update', validate('JsonValidator'), campus.update)
router.post('/campuses/create', validate('JsonValidator'),  campus.create)
router.post('/campuses/pagination', validate('pagination'), campus.getCampusPage)
router.post('/campuses/search',  campus.search)
router.post('/campuses/findone', validate('single'), campus.findOne)
router.post('/campuses/delete',  validate('delete'), campus.delete)

module.exports = router;  