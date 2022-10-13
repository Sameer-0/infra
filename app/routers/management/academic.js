const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const academiccontroller = require("../../controllers/management/academic")
const acadsessioncontroller = require("../../controllers/management/academicsession")
const acadCalender = require("../../controllers/management/academiccalender")
const acadYearcontroller = require('../../controllers/management/academicYear');
const validate = require('../../middlewares/validate')


//ACADEMIC YEAR ROUTER
router.get('/academic/academic-year', acadYearcontroller.getAcadYearPage)
router.post('/academic/academic-year', validate('createAcadYear'), acadYearcontroller.updateAcadYear)

// ACADEMIC ROUTER
router.get('/academic', academiccontroller.getPage)

//ACADEMIC SESSION
router.get('/academic/session', acadsessioncontroller.getPage)
router.post('/academic/session/create', validate('createSession'), acadsessioncontroller.create)
router.post('/academic/session/update', validate('updateSession'), acadsessioncontroller.update)
router.post('/academic/session/search', validate('search'), acadsessioncontroller.search)
router.post('/academic/session/findone', validate('single'), acadsessioncontroller.single)
router.post('/academic/session/pagination', validate('pagination'), acadsessioncontroller.pagination)

//ACADEMIC CALENDER
router.get('/academic/calender', acadCalender.getPage)
router.post('/academic/calender/search', validate('search'), acadCalender.search)
router.post('/academic/calender/pagination', validate('pagination'), acadCalender.pagination)
router.post('/academic/calender/refresh', acadCalender.refresh)
module.exports = router;