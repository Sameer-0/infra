const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const index =  require('../../controllers/admin/faculty/index')
const works =  require('../../controllers/admin/faculty/works')
const dateTimes = require('../../controllers/admin/faculty/dateTimes')
const preferences = require('../../controllers/admin/faculty/preferences')
const batch = require('../../controllers/admin/faculty/batch')
const allocation = require('../../controllers/admin/faculty/allocation')
const validate = require('../../middlewares/validate')


//Faculty
router.get('/faculties', index.getPage)
router.post('/faculties/create', validate('JsonValidator'), index.create)
router.post('/faculties/search', validate('search'), index.search)
router.post('/faculties/pagination', index.pagination)
router.post('/faculties/findone', validate('single'), index.findOne)
router.post('/faculties/update', validate('JsonValidator'), index.update)
router.post('/faculties/delete', validate('delete'), index.delete)
router.get('/faculties/download', index.downloadMaster)
router.post('/faculties/show-entries', index.showEntries)



//Faculty Date Time
router.get('/faculties/date-time', dateTimes.getPage)
router.post('/faculties/date-time/create',validate('JsonValidator'), dateTimes.create)
router.post('/faculties/date-time/search', dateTimes.search)
router.post('/faculties/date-time/pagination', dateTimes.pagination)
router.post('/faculties/date-time/delete', validate('delete'), dateTimes.delete)
router.post('/faculties/date-time/getslottime', dateTimes.getSlotsById)
router.post('/faculties/date-time/findone', dateTimes.findOne)
router.post('/faculties/date-time/update',validate('JsonValidator'), dateTimes.update)
router.get('/faculties/date-time/download', dateTimes.downloadMaster)
router.post('/faculties/date-time/show-entries', dateTimes.showEntries)

//Batch
router.get('/faculties/batch', batch.getPage)
router.post('/faculties/batch/create', validate('JsonValidator'), batch.create)
router.post('/faculties/batch/search', validate('search'), batch.search)
router.post('/faculties/batch/pagination', batch.pagination)
router.post('/faculties/batch/update', validate('JsonValidator'), batch.update)
router.post('/faculties/batch/delete', validate('delete'), batch.delete)
router.post('/faculties/batch/program-by-facultyid', batch.programByFacultyId)
router.post('/faculties/batch/session-by-facultyid-and-programid', batch.sessionByFacultyProgramId)
router.post('/faculties/batch/module-by-facultyid-programid-sessionid', batch.moduleByFaculty)
router.post('/faculties/batch/division-by-moduleid', batch.divisionByModuleId)
router.post('/faculties/batch/batch-by-divisionid', batch.batchByDivisionId)
router.post('/faculties/batch/find-batch-by-facultyid', batch.batchByFacultyIdAndBatchId)
router.get('/faculties/batch/download', batch.downloadMaster)
router.post('/faculties/batch/show-entries', batch.showEntries)




//FACULTY ALLOCATION STATUS
router.get('/faculties/allocation-status', allocation.getPage)
router.post('/faculties/allocation-status', allocation.checkfacultyStatus)


//faculty works
router.get('/faculties/works', works.getPage)
router.post('/faculties/works/create', validate('JsonValidator'), works.create)
router.post('/faculties/works/search', validate('search'), works.search)
router.post('/faculties/works/pagination', works.pagination)
router.post('/faculties/works/update', validate('JsonValidator'), works.update)
router.post('/faculties/works/delete', validate('delete'), works.delete)
router.post('/faculties/works/session-by-program', works.sessionByProgramId)
router.post('/faculties/works/module-by-program-session', works.moduleByprogramSession)
router.post('/faculties/works/findone', validate('single'), works.findOne)
router.post('/faculties/works/change', works.changeStatus)
router.post('/faculties/works/GetAll', works.getAll)
router.post('/faculties/works/get-faculty-work-events', works.getFacultyWorks)
router.get('/faculties/works/download', works.downloadMaster)
router.post('/faculties/works/show-entries', works.showEntries)
router.post('/faculties/works/allocation-faculties-for-lecture', works.allocationFaculties)


//workpreferences
router.get('/workpreferences', preferences.getPage)
router.post('/faculties/workpreferences/create', validate('JsonValidator'), preferences.create)
router.post('/faculties/workpreferences/search', preferences.search)
router.post('/faculties/workpreferences/pagination', preferences.pagination)
router.post('/faculties/workpreferences/update', validate('JsonValidator'), preferences.update)
router.post('/faculties/workpreferences/delete', validate('delete'), preferences.delete)
router.post('/faculties/workpreferences/faculty-slots-and-programs', validate('single'), preferences.getSlotsByIdAndPrograms)
router.post('/faculties/workpreferences/module-by-program-session-id', preferences.moduleByprogramAndSessionId)
router.get('/faculties/workpreferences/download', preferences.downloadMaster)
router.post('/faculties/workpreferences/show-entries', preferences.showEntries)

router.post('/faculties/workpreferences/programby-facultyid', validate('single'), preferences.getProgramFacultyId)
router.post('/faculties/workpreferences/findby-programid', preferences.findByProgramId)
router.post('/faculties/workpreferences/findby-program-session', preferences.findByProgramSessionId)
//Get Days by program id for faculty preference
router.post('/faculties/workpreferences/session-day-by-program-id', preferences.sessionDayByProgramId)
router.post('/faculties/workpreferences/faculty-work-preference-by-pro-sess-module', preferences.facultyWorkloadForPrefernce)
router.post('/faculties/workpreferences/find-one', preferences.findOne)
module.exports = router