const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const slug = require('../../controllers/management/slug');
const validator =  require('../../middlewares/validator')
const validate = require('../../middlewares/validate')

//SLUG ROUTER
router.get('/slug', slug.getPage)
router.post('/slug/create', validate('createSlug'), slug.create)
router.post('/slug/update', validate('updateSlug'), slug.update)
router.post('/slug/delete', validate('delete'), slug.delete)
router.post('/slug/single', validate('single'), slug.single)
router.post('/slug/search', validate('search'), slug.search)

module.exports = router;