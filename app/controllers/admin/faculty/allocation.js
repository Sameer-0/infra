const {
    check,
    oneOf,
    validationResult
} = require('express-validator');
const Faculties = require('../../../models/Faculties')
const Days = require('../../../models/Days')
const SlotIntervalTiming = require('../../../models/SlotIntervalTimings')

module.exports = {

    getPage: (req, res) => {
        Promise.all([Faculties.fetchAll(10000, res.locals.slug), Days.fetchAll(10, res.locals.slug), SlotIntervalTiming.slotTimesForSchoolTiming(res.locals.slug)]).then(result => {
            res.render('admin/faculty/facultyallocationstatus', {
                facultyList: result[0].recordset,
                dayList: JSON.stringify(result[1].recordset),
                timeSlotList:JSON.stringify(result[2].recordset),
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })
    },

    checkfacultyStatus: (req, res, next) => {
        console.log('BODY::::::>>',req.body)
        Promise.all([Days.fetchAll(10, res.locals.slug),  Faculties.facultyAvailableSlot(res.locals.slug, req.body.faculty_id), Faculties.facultyBookedSlot(res.locals.slug, req.body.faculty_id)]).then(result => {
            //console.log('AVAILABLE::::::::>>',result[1].recordset)
            //console.log('BOOKED::::::::>>',result[2].recordset)
            res.status(200).json({
                status: 200,
                message: "success",
                daysdata: result[0].recordset,
                availableSlot: result[1].recordset,
                bookedSlot: result[2].recordset
                
            })
        })
    }
}