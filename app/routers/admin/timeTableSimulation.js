const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const index =  require('../../controllers/admin/timeTableSimulation/index')
const allocation =  require('../../controllers/admin/timeTableSimulation/allocation')
const timeTable =  require('../../controllers/admin/timeTableSimulation/timetable');


//TIME TABLE SIMULATION 
router.get('/time-table-simulation', index.getPage)

//TIME TABLE ALLOCATION
router.get('/time-table-simulation/allocation', allocation.getPage)
router.post('/time-table-simulation/allocation/generate', allocation.generateTimeTable)

//TIMETABLE DEALLOCATION
router.post('/time-table-simulation/de-allocate', allocation.deAllocateTimeTable)
// router.post('/time-table-simulation/allocation/clear', allocation.clearTimeTable)

//TIME TABLE 
router.get('/time-table-simulation/time-table', timeTable.getPage)
router.post('/time-table-simulation/time-table', timeTable.getSessionByProgram)
router.post('/time-table-simulation/time-table/events', timeTable.getEventsByProgramSessionDay)
router.post('/time-table-simulation/time-table/pending-events', timeTable.getPendingEvents)
router.post('/time-table-simulation/time-table/pending-events-sessions', timeTable.getPendingEventSessions)
router.post('/time-table-simulation/time-table/pending-events-module', timeTable.getPendingEventModule)
router.post('/time-table-simulation/time-table/drop-event', timeTable.dropEvent)
router.post('/time-table-simulation/time-table/schedule-event', timeTable.scheduleEvent)
router.post('/time-table-simulation/time-table/swap-events', timeTable.swapEvents) 
router.get('/time-table-simulation/time-table/download', timeTable.downloadMaster) 
router.get('/time-table-simulation/time-table/div-allocation', timeTable.getDivAllocationPage)
router.post('/time-table-simulation/time-table/get-div-allocation', timeTable.getDivAllocation)


router.post('/time-table-simulation/allocate-faculties', timeTable.allocateFaculties) 
router.post('/time-table-simulation/deallocate-faculties', timeTable.deallocateFaculties) 



module.exports = router