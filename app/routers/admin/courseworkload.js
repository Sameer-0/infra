const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');
const validate = require('../../middlewares/validate')
const courseworkload = require('../../controllers/admin/courseworkload/workload')
const preference = require('../../controllers/admin/courseworkload/preference')
const index = require('../../controllers/admin/courseworkload/index')
const moduleAbbr = require('../../controllers/admin/courseworkload/moduleAbbr')
router.get('/courseworkload', index.getPage)
router.post('/courseworkload', index.fetchFromSAP)
// router.post('/courseworkload', courseworkload.fetchFromSAP)
// router.post('/courseworkload/changestatus', courseworkload.changestatus)
// router.get('/courseworkload/getAll', courseworkload.getAll)
// router.get('/courseworkload/search', courseworkload.search)
// router.post('/courseworkload/pagination', courseworkload.pagination)
// router.put('/courseworkload', validate('JsonValidator'), courseworkload.update)


//WORKLOAD
router.get('/courseworkload/workload', courseworkload.getPage)
router.post('/courseworkload/workload/changestatus', courseworkload.changestatus)
router.get('/courseworkload/workload/getAll', courseworkload.getAll)
router.post('/courseworkload/workload/search', courseworkload.search)
router.post('/courseworkload/workload/pagination', courseworkload.pagination)
router.post('/courseworkload/workload/update', validate('JsonValidator'), courseworkload.update)
router.post('/courseworkload/workload/create', validate('JsonValidator'), courseworkload.create)
router.post('/courseworkload/workload/delete',  courseworkload.delete)
router.post('/courseworkload/workload/session-by-programid',  courseworkload.sessionByProgramIdWSDL)
router.post('/courseworkload/workload/fetching-courses',  courseworkload.courseBySessionIdAndProgramId)
router.post('/courseworkload/workload/workload-by-programid',  courseworkload.workloadByProgramId)
router.post('/courseworkload/workload/workload-by-programid-sessionid',  courseworkload.workloadByProgramIdSessionId)
router.get('/courseworkload/workload/download', courseworkload.downloadMaster)
router.post('/courseworkload/workload/show-entries', courseworkload.showEntries)

//Course preference
router.get('/courseDayRoomPreference', preference.getPage)
router.post('/courseDayRoomPreference/create', preference.create)
router.post('/courseDayRoomPreference/search', preference.search)
router.post('/courseDayRoomPreference/pagination', preference.pagination)
router.post('/courseDayRoomPreference/acadSessionList', validate('isArrayNumber'), preference.acadSessionList)
router.post('/courseDayRoomPreference/courseList', preference.courseList)
router.post('/courseDayRoomPreference/divList', preference.divList)
router.post('/courseDayRoomPreference/refresh', preference.refresh)
router.post('/courseDayRoomPreference/batch-by-divisionid', validate('isArrayNumber'), preference.batchByDivisionId)
router.post('/courseDayRoomPreference/find-semester-by-programid',  preference.findSemesterByProgramId)
router.post('/courseDayRoomPreference/find-module-by-programid-semesterid',  preference.findModuleByProgramIdSemId)
router.post('/courseDayRoomPreference/find-division-by-moduleid',  preference.findDivisionByModuleId)
router.post('/courseDayRoomPreference/filter-records',  preference.filterPreference)
router.post('/courseDayRoomPreference/occupiedroomdays', preference.occupiedRoomDays)

//MODULE ABBR UPDATE
router.get('/courseworkload/workload/module-abbr',moduleAbbr.getPage)
router.post('/courseworkload/workload/module-abbr/update', validate('JsonValidator'), moduleAbbr.update)
module.exports = router