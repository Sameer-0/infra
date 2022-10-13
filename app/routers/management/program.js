const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const program = require("../../controllers/management/program")
const validate = require('../../middlewares/validate')
const programType = require('../../controllers/admin/programs/programType')
//PROGRAM ROUTER
router.get('/programs', program.getPage)


// PROGRAM TYPE ROUTER
router.get('/programs/types', programType.getProgramTypePage)
router.post('/programs/types/create', validate('createProgramType'), programType.create)
router.post('/programs/types/update', validate('updateProgramType'), programType.update)
router.post('/programs/types/delete',  programType.delete)
router.post('/programs/types/findone', programType.findOne)
router.post('/programs/types/search', validate('search'), programType.search)
router.post('/programs/pagination', validate('pagination'), programType.pagination)

module.exports = router;