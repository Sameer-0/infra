const router = require('express').Router();
const {
    check,
    validationResult
} = require('express-validator');

const buildingcontroller = require('../../controllers/management/building');
const campuscontroller = require('../../controllers/management/campus');
const orgcontroller = require('../../controllers/management/organization');
const dashcontroller = require('../../controllers/management/dashboard');
const roomcontroller = require('../../controllers/management/room');
const roomtype = require('../../controllers/management/roomtype');
const acadYearcontroller = require('../../controllers/management/academicYear');
const slugcontroller = require('../../controllers/management/slug');
const rtscontroller = require("../../controllers/management/roomtransactionstages")
const rtypescontroller = require("../../controllers/management/roomtransactiontypes")
const roomtransactioncontroller = require("../../controllers/management/roomtransactions")
const roomslotscontroller = require("../../controllers/management/roomslots")
const programcontroller = require("../../controllers/management/program")
const divisioncontroller = require('../../controllers/management/division')
const acadsession = require('../../controllers/management/academicsession')
const acadcalendercontroller = require('../../controllers/management/academiccalender')
const cancellationreasonscontroller = require('../../controllers/management/cancellationreasons')
const roomcancellationreasonscontroller = require('../../controllers/management/roombookingrejectionreasons')
//ACADEMIC YEAR ROUTER
router.get('/academic/academic-year', acadYearcontroller.getAcadYearPage)
router.post('/academic/academic-year', acadYearcontroller.updateAcadYear)

// BUILDING ROUTER
router.get('/building', buildingcontroller.getBuildingPage)
router.put('/building', buildingcontroller.updateBuilding)
router.post('/building', buildingcontroller.getAdd)
router.post('/building/pagination', [check('pageNo', 'Invalid Page No').exists().trim().escape()], buildingcontroller.getBuildingPage)
router.get('/building/single', buildingcontroller.getSingleBuilding)
router.get('/building/search', [check('keyword', 'Invalid keyword').exists().trim().escape()], buildingcontroller.searchBuilding)
router.delete('/building', buildingcontroller.deleteById)

// CAMPUS ROUTER
router.get('/campus', campuscontroller.getCampusPage)
router.put('/campus', campuscontroller.updateCampus)
router.post('/campus', campuscontroller.createCampus)
router.post('/campus', [check('pageNo', 'Invalid Page No').exists().trim().escape()], campuscontroller.getCampusPage)
router.get('/campus/search', [check('keyword', 'Invalid keyword').exists().trim().escape()], campuscontroller.search)
router.get('/campus/single', campuscontroller.getCampusById)
router.delete('/campus/delete', campuscontroller.deleteById)

// ORGANIZATION ROUTER
router.get('/organization', orgcontroller.getPage)
router.post('/organization', orgcontroller.createOrg)
router.put('/organization', orgcontroller.updateOrgById)
router.delete('/organization', orgcontroller.deleteById)
router.post('/organization/pagination', [check('pageNo', 'Invalid Page No').exists().trim().escape()], orgcontroller.getPage)
router.post('/organization/single', orgcontroller.getOrgById)
router.post('/organization/search', [check('keyword', 'Invalid keyword').exists().trim().escape()], orgcontroller.search)

//SLUG ROUTER
router.get('/slug', slugcontroller.getPage)
router.post('/slug', slugcontroller.createSlug)
router.put('/slug', slugcontroller.updateSlugById)
router.delete('/slug', slugcontroller.deleteSlugById)
router.get('/slug/single', slugcontroller.getSlugById)
router.get('/slug/search', [check('keyword', 'Invalid keyword').exists().trim().escape()], slugcontroller.search)

//DASHBOARD ROUTER
router.get('/dashboard', dashcontroller.getDashboard)

//ROOM ROUTER
router.get('/room', roomcontroller.getPage)
router.post('/room/fetch-single', roomcontroller.getSingleRoom)
router.post('/room/update', roomcontroller.updateRoomById)
router.post('/room/delete-room', roomcontroller.deleteRoomById)
router.post('/room/add-room', roomcontroller.addRoom)
router.post('/room-search', [check('keyword', 'Invalid keyword').exists().trim().escape()], roomcontroller.searchRoom)

//ROOM TYPE ROUTER
router.get('/room/roomtype', roomtype.getRoomTypePage)
router.put('/room/roomtype', roomtype.updateRoomTypeById)
router.post('/room/roomtype', roomtype.createRoomType)
router.get('/room/roomtype/single', roomtype.getRoomTypeById)
router.get('/room/roomtype/search', [check('keyword', 'Invalid keyword').exists().trim().escape()], roomtype.search)
router.delete('/room/roomtype/delete', roomtype.deleteRoomTypeById)


// ROOM TRANSACTION STATGE =  rtstage
router.get('/room/rtstage', rtscontroller.getPage)
router.put('/room/rtstage', rtscontroller.updateRoomTrabsactionStagesById)
router.post('/room/rtstage', rtscontroller.createRoomTrabsactionStages)
router.get('/room/rtstage/single', rtscontroller.getRoomTrabsactionStagesById)
router.get('/room/rtstage/search', [check('keyword', 'Invalid keyword').exists().trim().escape()], rtscontroller.search)
router.delete('/room/rtstage', rtscontroller.deleteRoomTrabsactionStagesById)


// ROOM TRANSACTION TYPES =  rtypes
router.get('/room/rtypes', rtypescontroller.getPage)
router.post('/room/rtypes', rtypescontroller.createRoomTrabsactionStages)
router.get('/room/rtypes/single', rtypescontroller.getRoomTrabsactionStagesById)
router.put('/room/rtypes', rtypescontroller.updateRoomTrabsactionStagesById)
router.delete('/room/rtypes', rtypescontroller.deleteRoomTrabsactionStagesById)
router.get('/room/rtypes/search', [check('keyword', 'Invalid keyword').exists().trim().escape()], rtypescontroller.search)

// ROOM TRANSACTION
router.get('/room/transaction', roomtransactioncontroller.getPage)
router.post('/room/transaction/single', roomtransactioncontroller.viewDetails)
router.post('/room/transaction/approve-trans', roomtransactioncontroller.approveTrans)
router.get('/room/transaction/search', [check('keyword', 'Invalid keyword').exists().trim().escape()], roomtransactioncontroller.search)

//ROOM SLOTS ROUTER
router.get('/room/slots', roomslotscontroller.getPage)

//PROGRAM ROUTER
router.get('/program', programcontroller.getPage)


//DIVISION ROUTER
router.get('/divisions', divisioncontroller.getPage)


//ACADEMIC ROUTER
router.get('/academic', acadsession.getPage)
router.get('/academic/session', acadsession.acadSessionPage)
router.get('/academic/session/search', acadsession.acadSessionSearch)
router.post('/academic/session', acadsession.addAcadSession)
router.get('/academic/session/single', acadsession.getSingleAcadSession)
router.put('/academic/session', acadsession.updateAcadSession)
router.delete('/academic/session', acadsession.deleteAcadSession)

//ACADEMIC CALENDER
router.get('/academic/calender', acadcalendercontroller.getPage)
router.get('/academic/calender/search', acadcalendercontroller.search)
//CANCELLATION REASONS ROUTER
router.get('/cancellationreasons', cancellationreasonscontroller.getPage)
router.post('/cancellationreasons', cancellationreasonscontroller.create)
router.get('/cancellationreasons/single', cancellationreasonscontroller.getById)
router.put('/cancellationreasons', cancellationreasonscontroller.update)
router.delete('/cancellationreasons', cancellationreasonscontroller.delete)
router.get('/cancellationreasons/search', cancellationreasonscontroller.search)

// ROOM CANCELATION REASONS ROUTER
router.get('/room/bookingrejectionreasons', roomcancellationreasonscontroller.getPage)
router.post('/room/bookingrejectionreasons', roomcancellationreasonscontroller.create)
router.get('/room/bookingrejectionreasons/single', roomcancellationreasonscontroller.getById)
router.put('/room/bookingrejectionreasons', roomcancellationreasonscontroller.update)
router.delete('/room/bookingrejectionreasons', roomcancellationreasonscontroller.delete)
router.get('/room/bookingrejectionreasons/search', roomcancellationreasonscontroller.search)
module.exports = router;