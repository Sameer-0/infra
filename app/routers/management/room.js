const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const roomcontroller = require('../../controllers/management/rooms')
const roomslotscontroller = require("../../controllers/management/roomslots")
const roomtype = require('../../controllers/management/roomtype')
const bookings = require('../../controllers/management/bookings')
const validate = require('../../middlewares/validate')
const roomValidate = require('../../middlewares/roomValidate')
const transactionTypes = require('../../controllers/management/roomtransactiontypes')
const transactionStage = require('../../controllers/management/roomtransactionstages')
const transaction = require('../../controllers/management/roomtransactions')
const RoomRequest = require('../../controllers/management/RoomRequest')

//ROOM ROUTER
router.get('/rooms', roomcontroller.getPage)
router.get('/rooms/room', roomcontroller.getRoomPage)
router.post('/rooms/findone', roomcontroller.findOne)
router.post('/rooms/update', validate('JsonValidator'), roomcontroller.update)
router.post('/rooms/room/delete', validate('delete'), roomcontroller.delete)
router.post('/rooms/create', validate('JsonValidator'), roomcontroller.addRoom)
router.post('/rooms/search', roomcontroller.searchRoom)
router.post('/rooms/rooms_isprocessed', roomcontroller.isProcessed)
router.post('/rooms/buildinglist', roomcontroller.buildingList)
router.post('/rooms/pagination', validate('pagination'), roomcontroller.pagination)
router.post('/rooms/room/getroomtimeslots', roomcontroller.getRoomTimeSlots)
router.post('/rooms/room/refresh', roomcontroller.refresh)


//ROOM TYPE ROUTER
router.get('/rooms/roomtypes', roomtype.getPage)
router.post('/rooms/roomtypes/update', validate('updateRoomType'), roomtype.update)
router.post('/rooms/roomtypes/create', validate('createRoomType'), roomtype.create)
router.post('/rooms/roomtypes/findone', validate('single'), roomtype.single)
router.post('/rooms/roomtypes/search',  roomtype.search)
router.post('/rooms/roomtypes/delete', roomtype.delete)


//ROOM SLOTS ROUTER
router.get('/room/slots', roomslotscontroller.getPage)


//ROOM BOOKING

router.get('/rooms/bookings', bookings.getPage)


//ROOM TRANSACTION
router.get('/rooms/bookings/transaction-types', transactionTypes.getPage)
router.post('/rooms/bookings/transaction-types/delete', transactionTypes.delete)
router.post('/rooms/bookings/transaction-types/findone', validate('single'), transactionTypes.findOne)
router.post('/rooms/bookings/transaction-types/create', validate('JsonValidator'), transactionTypes.create)
router.post('/rooms/bookings/transaction-types/update', validate('JsonValidator'), transactionTypes.update)
router.post('/rooms/bookings/transaction-types/search',  transactionTypes.search)
router.post('/rooms/bookings/transaction-types/pagination', validate('pagination'), transactionTypes.pagination)

//ROOM TRANSACTION STAGE:
router.get('/rooms/bookings/transaction-stages', transactionStage.getPage)
router.post('/rooms/bookings/transaction-stages/update', validate('updateRtstage'), transactionStage.update)
router.post('/rooms/bookings/transaction-stages/create', validate('createRtstage'), transactionStage.create)
router.post('/rooms/bookings/transaction-stages/findone', validate('single'), transactionStage.findOne)
router.post('/rooms/bookings/transaction-stages/search',  transactionStage.search)
router.post('/rooms/bookings/transaction-stages/delete', transactionStage.delete)



// ROOM TRANSACTION
router.get('/rooms/bookings/transactions', transaction.getPage)
router.post('/rooms/bookings/transactions/findOne', transaction.findOne)
router.post('/rooms/bookings/transactions/approve-trans', transaction.approveTrans)
router.post('/rooms/bookings/transactions/search',  transaction.search)


//ROOM REQUESTS
router.get('/rooms/requests', RoomRequest.getPage)
router.post('/rooms/requests/search',  RoomRequest.search)
router.post('/rooms/requests/pagination', validate('pagination'), RoomRequest.pagination)
router.post('/rooms/requests/roomInfo', RoomRequest.roomInfo)
router.post('/rooms/requests/approval', RoomRequest.requestApproval)

module.exports = router;