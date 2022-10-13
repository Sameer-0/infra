const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const roomrejection = require("../../controllers/management/roombookingrejectionreasons")
const cancellationreasons = require("../../controllers/management/cancellationreasons")
const validator = require('../../middlewares/validator')
const validate = require('../../middlewares/validate')

// BOOKING REJECTION REASONS
router.get('/room/bookingrejectionreasons', roomrejection.getPage)
router.post('/room/bookingrejectionreasons/create', validate('createBookingRejectionReasons'), roomrejection.create)
router.post('/room/bookingrejectionreasons/update', validate('updateBookingRejectionReasons'), roomrejection.update)
router.post('/room/bookingrejectionreasons/search', validate('search'), roomrejection.search)
router.post('/room/bookingrejectionreasons/findone', roomrejection.getById)
router.post('/room/bookingrejectionreasons/delete', roomrejection.delete)

//BOOKING CANCELLATION REASONS
router.get('/cancellationreasons', cancellationreasons.getPage)
router.post('/cancellationreasons/create', validate('createCancellationreasons'), cancellationreasons.create)
router.post('/cancellationreasons/update', validate('updateCancellationreasons'), cancellationreasons.update)
router.post('/cancellationreasons/findone', validate('single'), cancellationreasons.single)
router.post('/cancellationreasons/search', validate('search'), cancellationreasons.search)
router.post('/cancellationreasons/delete', validate('delete'), cancellationreasons.delete)

module.exports = router;