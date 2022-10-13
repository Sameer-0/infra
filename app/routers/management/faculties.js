const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const faculties = require('../../controllers/management/faculties');
const types = require('../../controllers/management/FacultyTypes');
const slots = require('../../controllers/management/facultyslot');
const validate = require('../../middlewares/validate')
const facultypool = require('../../controllers/management/facultypool');

// FACULTY ROUTER
router.get('/faculties/faculty', faculties.getPage)
router.post('/faculties/faculty/create', faculties.create)
router.post('/faculties/faculty/update', validate('JsonValidator'), faculties.update)
router.post('/faculties/faculty/pagination', validate('pagination'), faculties.pagination)
router.post('/faculties/faculty/findone', validate('single'), faculties.findOne)
router.post('/faculties/faculty/search',  faculties.search)
router.post('/faculties/faculty/delete', faculties.delete)
router.post('/faculties/faculty/processing', faculties.processing)
router.post('/faculties/faculty/GetAll', faculties.GetAll)
router.post('/faculties/faculty/fetchformsap', faculties.fetchFromSAP)

// FACULTY TYPES ROUTER
router.get('/faculties/types', types.getPage)
router.post('/faculties/types/create', validate('JsonValidator'), types.create)
router.post('/faculties/types/findone', validate('single'), types.findOne)
router.post('/faculties/types/search', validate('search'), types.search)
router.post('/faculties/types/update', validate('JsonValidator'), types.update)
router.post('/faculties/types/delete', types.delete)
router.post('/faculties/types/pagination', validate('pagination'), types.pagination)

// FACULTY SLOATS ROUTER
router.get('/faculties/slots', slots.getPage)


//FACULTY POOL
// FACULTY ROUTER
router.get('/faculties', facultypool.getPage)
router.post('/faculties/refresh', facultypool.refresh)
router.post('/faculties/pagination', facultypool.pagination)
router.post('/faculties/search', facultypool.search)
// router.post('/faculties/faculty', validate('JsonValidator'), faculties.create)
// router.put('/faculties/faculty', validate('JsonValidator'), faculties.update)
// router.post('/faculties/faculty/pagination', validate('pagination'), faculties.pagination)
// router.get('/faculties/facultyfindOne', validate('single'), faculties.findOne)
// router.get('/faculties/faculty/search', validate('search'), faculties.search)
// router.delete('/faculties/faculty', faculties.delete)
// router.patch('/faculties/faculty', faculties.deleteAll)
// router.post('/faculties/faculty/processing', faculties.processing)
// router.get('/faculties/faculty/GetAll', faculties.GetAll)
// router.post('/faculties/faculty/fetchformsap', faculties.fetchFromSAP)
module.exports = router;