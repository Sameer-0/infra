const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const slotIntervalSetting = require("../../controllers/management/slotinterval/intervalsetting")
const slotIntervalTiming = require("../../controllers/management/slotinterval/intervaltiming")
const validator =  require('../../middlewares/validator')
const validate = require('../../middlewares/validate')

//SLOT INTERVALS
router.get('/slotinterval', slotIntervalSetting.getMainPage)
router.get('/slotinterval/setting', slotIntervalSetting.getPage)
router.post('/slotinterval/setting/create', validate('createSlotIntrSetting'), slotIntervalSetting.create)
router.post('/slotinterval/setting/update', validate('updateSlotIntrSetting'), slotIntervalSetting.update)
router.post('/slotinterval/setting/single', validate('single'), slotIntervalSetting.single)
router.post('/slotinterval/setting/delete', validate('delete'), slotIntervalSetting.delete)
router.post('/slotinterval/setting/search', validate('search'), slotIntervalSetting.search)


//SLOT INTERVAL TIMING
router.get('/slotinterval/timing', slotIntervalTiming.getPage)
router.post('/slotinterval/timing/create', validate('createSlotIntrTime'), slotIntervalTiming.create)
router.put('/slotinterval/timing/update', validate('updateSlotIntrTime'), slotIntervalTiming.update)
router.post('/slotinterval/timing/single', validate('single'), slotIntervalTiming.single)
router.post('/slotinterval/timing/delete', validate('delete'), slotIntervalTiming.delete)
router.post('/slotinterval/timing/search', validate('search'), slotIntervalTiming.search)
module.exports = router;