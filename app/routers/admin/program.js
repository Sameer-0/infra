const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const program = require("../../controllers/admin/programs/program")
const days = require("../../controllers/admin/programs/days")
const sessions = require("../../controllers/admin/programs/sessions")
const programType = require('../../controllers/admin/programs/programType')
const timePreference = require('../../controllers/admin/programs/timePreference')
const validate = require('../../middlewares/validate')


//PROGRAM ROUTER
router.get('/programs', program.getPage)
router.post('/programs/pagination', validate('pagination'), program.pagination)
router.post('/programs/update', validate('JsonValidator'), program.update)
router.post('/programs/search', validate('search'), program.search)
router.post('/programs/findone', validate('search'), program.findOne)
router.post('/programs/create', validate('JsonValidator'), program.create)
router.post('/programs/delete', validate('delete'), program.delete)
router.get('/programs/download', program.downloadMaster)
router.post('/programs/show-entries', program.showEntries)



// PROGRAM TYPE ROUTER
router.get('/programs/types', programType.getProgramTypePage)
router.post('/programs/types/create', validate('createProgramType'), programType.create)
router.post('/programs/types/update', validate('updateProgramType'), programType.update)
router.post('/programs/types/delete',  programType.delete)
router.post('/programs/types/findone', programType.findOne)
router.post('/programs/types/search', validate('search'), programType.search)
router.post('/programs/pagination', validate('pagination'), programType.pagination)


//PROGRAM DAYS
router.get('/programs/days', days.getPage)
router.post('/programs/days/pagination', days.pagination)
router.post('/programs/days/search', days.search)
router.post('/programs/days/change', days.changeStatus)
router.post('/programs/days/GetAll', days.getAll)
router.post('/programs/days/refresh', days.refresh)
router.get('/programs/days/download', days.downloadMaster)
router.post('/programs/days/show-entries', days.showEntries)


//PROGRAM SESSIONS
router.get('/programs/sessions', sessions.getPage)
router.post('/programs/sessions/pagination', validate('pagination'), sessions.pagination)
router.post('/programs/sessions/search', validate('search'), sessions.search)
router.post('/programs/sessions/refresh', sessions.refresh)
//router.post('/programs/sessions/refresh', sessions.refresh)
router.post('/programs/sessions/program-sessions', sessions.getSessionsByProgram)
router.post('/programs/sessions/unlocked-program-sessions', sessions.getUnlockedSessionsByProgram)
router.post('/programs/sessions/sessions-for-program', sessions.getSessions)
router.get('/programs/sessions/download', sessions.downloadMaster)
router.post('/programs/sessions/show-entries', sessions.showEntries)



//PROGRAM SESSION TIME PREFERENCE
router.get('/program-session-time-preference', timePreference.getPage)
router.post('/program-session-time-preference/create', timePreference.create)
router.post('/program-session-time-preference/findone', timePreference.findOne)
router.post('/program-session-time-preference/update', timePreference.update)
router.post('/program-session-time-preference/delete', timePreference.delete)
router.post('/program-session-time-preference/search', timePreference.search)
router.post('/program-session-time-preference/show-entries', timePreference.showEntries)

module.exports = router;