const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const organization = require('../../controllers/management/organization');
const validate = require('../../middlewares/validate')


// ORGANIZATION ROUTER
router.get('/organizations', organization.getPage)
router.post('/organizations/create', validate('JsonValidator'), organization.create)
router.post('/organizations/update', validate('JsonValidator'), organization.update)
router.post('/organizations/delete', validate('delete'), organization.delete)
router.post('/organization/pagination', validate('pagination'), organization.getPage)
router.post('/organizations/findone', validate('single'), organization.single)
router.post('/organizations/search',  organization.search)


module.exports = router;