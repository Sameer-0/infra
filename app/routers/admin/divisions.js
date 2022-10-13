const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const index =  require('../../controllers/admin/divisions/index')
const batch = require('../../controllers/admin/divisions/batch')
const validate = require('../../middlewares/validate')


router.get('/divisions', index.getPage)
router.post('/divisions/update', validate('JsonValidator'), index.update)
router.post('/divisions/search', index.search)
router.post('/divisions/pagination', index.pagination)
router.post('/divisions/change', index.changestatus)
router.post('/divisions/getAll', index.getAll)
router.post('/divisions/generate-division', index.generateDivision)
router.post('/divisions/delete', index.delete)
router.post('/divisions/division-by-moduleid', index.divisionByModuleId)
router.post('/divisions/division-by-programid', index.divisionByProgramId)
router.get('/divisions/download', index.downloadMaster)
router.post('/divisions/show-entries', index.showEntries)
router.post('/divisions/program-session-div', index.getUniqueDiv)

//BATCHES
router.get('/divisions/batches', batch.getPage)
router.post('/divisions/batches/search', batch.search)
router.post('/divisions/batches/pagination', batch.pagination)
router.post('/divisions/batches/changestatus', batch.changestatus)
router.post('/divisions/batches/getAll', batch.getAll)
router.post('/divisions/batches/update', batch.update)
router.post('/divisions/batches/generate-batches-division', batch.generateBatch)
router.post('/divisions/batches/delete', batch.delete)
router.post('/divisions/batches/batch-by-moduleid', batch.divisionByModuleId)
router.post('/divisions/batches/batch-by-programid', batch.batchByProgramId)
router.get('/divisions/batches/download', batch.downloadMaster)
router.post('/divisions/batches/show-entries', batch.showEntries)
router.post('/divisions/batches/get-batches-from-division', batch.getBatchesFromDivision)


module.exports = router