const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');
 
const index =  require('../../controllers/admin/rescheduling/index')

//RESCHEDULING EVENTS
router.get('/rescheduling', index.getPage) 
router.post('/rescheduling/fetch-lecture-by-date-range-faculty', index.fetchLectureByDateRangeFaculty) 
router.post('/rescheduling/get-replacing-faculties', index.getReplacingFaculties)
router.post('/rescheduling/fetch-cancelled-lecture', index.getCancelledLecture)
router.post('/rescheduling/fetch-bulk-cancel-pagination', index.fetchBulkCancelPagination)
router.post('/rescheduling/show-entries', index.showEntries)
router.post('/rescheduling/fetch-faculties-date-range', index.facultiesDateRange)
//router.post('/rescheduling/get-extra-class-faculties', index.getExtraClassFaculties)
router.post('/rescheduling/findby-programid', index.findByProgramId)
router.post('/rescheduling/find-division-by-programid-acadsession', index.findByDivisionByProgramSession)
router.post('/rescheduling/find-by-div-program-session', index.findBySchelDivisionByProgramSession)
router.post('/rescheduling/get-new-extra-lectures/', index.getNewExtraLectures)
router.post('/rescheduling/get-regular-extra-lecture/', index.getNewRegularLectures)
router.post('/rescheduling/get-cancelled-lectures', index.getCancelledLectures)
router.post('/rescheduling/get-faculties', index.getResFaculties)
router.post('/rescheduling/get-slots', index.getResSlots)
router.post('/rescheduling/get-faculties-rooms-modify', index.getResFacultiesRooms)
router.post('/rescheduling/get-rooms', index.getResRooms)
router.post('/rescheduling/get-divisionby-program-session-module', index.getDivisionByProgramSessionModule)
router.post('/rescheduling/fetch-available-room-by-day-time-range', index.fetchAvailableRoomAndFaculty)
router.post('/rescheduling/get-extra-class-faculties', index.getExtraClassFaculties)
router.post('/rescheduling/fetch-available-room-faculty-for-extra-class', index.fetchAvailableRoomAndFacultyForExtraClass)
router.post('/rescheduling/fetch-available-faculty-for-extra-class', index.fetchAvailableFacultyForExtraClass)
module.exports = router