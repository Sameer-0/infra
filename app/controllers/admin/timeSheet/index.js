const SessionCalendar = require('../../../models/SessionCalendar')
const Timesheet = require('../../../models/Timesheet')
const Rooms = require('../../../models/Rooms');
const SlotIntervalTiming = require('../../../models/SlotIntervalTimings')
const SchoolTimings = require('../../../models/SchoolTiming');
module.exports = {

    getPage: (req, res, next) => {
        Promise.all([SessionCalendar.fetchSessionStartEnd(res.locals.slug),  Rooms.fetchBookedRooms(res.locals.organizationId), SlotIntervalTiming.slotTimesForSchoolTiming(res.locals.slug), SchoolTimings.getTimeTableSimulationSlots(res.locals.slug, req.body.dayLid, req.body.programLid, req.body.acadSessionLid), Timesheet.getMinMaxTime(res.locals.slug)]).then(result => {

            res.render('admin/timesheet/index.ejs', {
                academicDate: result[0].recordset[0],
                roomList: JSON.stringify(result[1].recordset),
                roomListStr: result[1].recordset,
                timeSlotList: JSON.stringify(result[2].recordset),
                slotList: JSON.stringify(result[3].recordset),
                minMaxTime: JSON.stringify(result[4].recordset),
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl 
            })
        })
    },  


    checkDaysLecture: async (req, res, next) => {
        Timesheet.checkDaysLecture(res.locals.slug, req.body.monthInt).then(result => {
            res.status(200).json({
                status: 200,
                dateList: result.recordset
            }) 
        })
    },


    getSimulatedData: function (req, res, next) {
        console.log('req body for time sheet', req.body)
        Promise.all([Timesheet.SimulatedData(res.locals.slug, req.body.selectedDate),  Timesheet.SimulatedBreakData(res.locals.slug, req.body.dayLid)])
        .then(result => {
            console.log('result:::::::::::',result)
            if (result.length > 0) {
                res.json({
                    status: "200",
                    message: "Data fetched",
                    // date: result[0].recordset[0].date_str,
                    // dayName: result[0].recordset[0].day_str,
                    data: result[0].recordset,
                    breakData: result[1].recordset,
                })
            } else {
                res.json({
                    status: "200",
                    message: "Data not available",
                    data: []
                })
            }
        })

    }

}