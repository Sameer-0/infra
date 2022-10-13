const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const index =  require('../../controllers/admin/weeklyConstraint/index')

router.get('/weekly-constraint', index.getPage)
router.post('/weekly-constraint', index.create)
router.post('/weekly-constraint/findone', index.findOne)
router.post('/weekly-constraint/update', index.update)
router.post('/weekly-constraint/delete', index.delete)
router.post('/weekly-constraint/search', index.search)


module.exports = router