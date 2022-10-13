const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');


const events =  require('../../controllers/admin/events/index')
const eventCreation =  require('../../controllers/admin/events/eventCreation')
const types =  require('../../controllers/admin/events/types')
const validate = require('../../middlewares/validate')


router.get('/events/send-to-sap', eventCreation.getPage)
router.get('/events', events.getPage)

//EVENT TPES
router.get('/events/types', types.getPage)
router.post('/events/types/create', validate('EventType') , types.create)
router.post('/events/types/update', validate('EventType'), types.update)
router.post('/events/types/delete', types.delete)
router.post('/events/types/findone', types.findOne)
router.post('/events/types/search', types.search)
router.post('/events/types/pagination', types.pagination)
router.post('/events/types/refresh', types.refresh)
module.exports = router