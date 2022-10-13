const router = require('express').Router();


const {
    corsAccess
} = require("../../middlewares/cors")

const controller = require('../../controllers/admin/mobileApi/index')


router.post('/faculty/day-wise-lectures', corsAccess, controller.facultyDayWiseLectures)

router.post('/student/day-wise-lectures', corsAccess, controller.studentDayWiseLectures)

router.post('/division/fetch-all', corsAccess, controller.fetchAllDivisions)
//11-01-2021
router.post('/date/current-session', controller.getHoliday);
//CORES INABLE
router.post('/faculty/fetch-all-lectures', corsAccess, controller.getAllFacultyLectures);
router.post('/faculty/fetch-all-lectures-date-wise', corsAccess, controller.getAllFacultyLecturesDateWise);
router.post('/student/fetch-all-lectures-date-wise', corsAccess, controller.getAllStudentLecturesDateWise);
router.post('/student/fetch-all-lectures', corsAccess, controller.getAllStudentLectures);


module.exports = router;