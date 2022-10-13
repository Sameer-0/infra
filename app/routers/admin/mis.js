const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const index =  require('../../controllers/admin/mis/index')
const pivoted =  require('../../controllers/admin/mis/pivoted')
const facultydaywise =  require('../../controllers/admin/mis/facultydaywise')
const roomwiseallocation =  require('../../controllers/admin/mis/roomwiseallocation')

router.get('/mis/simulation-chart', index.getPage) 
router.get('/mis/simulation-chart/pivoted', pivoted.getPage) 
router.get('/mis/simulation-chart/faculty-day-wise', facultydaywise.getPage) 
router.post('/mis/simulation-chart/faculty-day-wise', facultydaywise.facultyDayWise) 
router.get('/mis/simulation-chart/faculty-day-wise/download/:faculty', facultydaywise.download) 
router.get('/mis/simulation-chart/room-wise-allocation', roomwiseallocation.getPage) 
router.post('/mis/simulation-chart/room-wise-allocation', roomwiseallocation.getRoomAllocation) 
router.get('/mis/simulation-chart/room-wise-allocation/download/:roomno', roomwiseallocation.download)
router.get('/mis/simulation-chart/division-wise-allocation/download/', roomwiseallocation.downloadDivisionWise) 
module.exports = router;