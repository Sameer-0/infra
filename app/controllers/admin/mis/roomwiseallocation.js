const Mis = require('../../../models/Mis')
const TimeTable = require('../../../models/TimeTable');
const ProgramSessions = require('../../../models/ProgramSessions');
const SlotIntervalTiming = require('../../../models/SlotIntervalTimings')
const Rooms = require('../../../models/Rooms');
const Days = require('../../../models/Days');
const isJsonString = require('../../../utils/util')
const excel = require("exceljs");

module.exports = {

    getPage: (req, res, next) => {
        Promise.all([
            Rooms.fetchBookedRooms(res.locals.organizationId),
            Days.fetchAll(10, res.locals.slug),
            SlotIntervalTiming.slotTimesForSchoolTiming(res.locals.slug),
        ]).then(result => {
            res.render('admin/mis/roomwiseallocation', {
                roomListStr: result[0].recordset,
                dayList: JSON.stringify(result[1].recordset),
                timeSlotList:JSON.stringify(result[2].recordset),
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })
    },



    getRoomAllocation: (req, res, next) => {
        console.log('division wise allocation', req.body)
        TimeTable.getRoomAllocation(res.locals.slug,  req.body.room_lid).then(result => {
           console.log('division allocation list:::', result.recordset)
            res.status(200).json({status:200, result: result.recordset})
        })
    },

    download:(req, res, next)=>{

        console.log('result:::::::::::::::::', req.params.roomno)
        let workbook = new excel.Workbook();
        let roomWiseWorksheet = workbook.addWorksheet('ROOM ALLOCATION STATUS');
        roomWiseWorksheet.columns = [
            {
                header: "Room Number",
                key: "room_number",
                width: 25
            },
            {
                header: "Monday",
                key: "Monday",
                width: 25
            },
            {
                header: "Tuesday",
                key: "Tuesday",
                width: 25
            },
            {
                header: "Wednesday",
                key: "Wednesday",
                width: 25
            },
            {
                header: "Thursday",
                key: "Thursday",
                width: 25
            },
            {
                header: "Friday",
                key: "Friday",
                width: 25
            },
            {
                header: "Saturday",
                key: "Saturday",
                width: 25
            }
        ]

        Mis.getRoomAllocationDownload(res.locals.slug, req.params.roomno).then(result => {
            roomWiseWorksheet.addRows(result.recordset)
                        // res is a Stream object
                        res.setHeader(
                            "Content-Type",
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        );
                         res.setHeader(
                            "Content-Disposition",
                            "attachment; filename=" + `roomwiseallocation.xlsx`
                        );
            
                        return workbook.xlsx.write(res).then(function () {
                            res.status(200).end();
                        });
        })
    },



    downloadDivisionWise:(req, res, next)=> {

        console.log('result:::::::::::::::::', req.params.roomno)
        let workbook = new excel.Workbook();
        let roomWiseWorksheet = workbook.addWorksheet('ROOM ALLOCATION STATUS');
        roomWiseWorksheet.columns = [
            {
                header: "Room Number",
                key: "room_number",
                width: 25
            },
            {
                header: "Monday",
                key: "Monday",
                width: 25
            },
            {
                header: "Tuesday",
                key: "Tuesday",
                width: 25
            },
            {
                header: "Wednesday",
                key: "Wednesday",
                width: 25
            },
            {
                header: "Thursday",
                key: "Thursday",
                width: 25
            },
            {
                header: "Friday",
                key: "Friday",
                width: 25
            },
            {
                header: "Saturday",
                key: "Saturday",
                width: 25
            }
        ]

        Mis.getRoomAllocationDownload(res.locals.slug, req.params.roomno).then(result => {
            roomWiseWorksheet.addRows(result.recordset)
                        // res is a Stream object
                        res.setHeader(
                            "Content-Type",
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        );
                         res.setHeader(
                            "Content-Disposition",
                            "attachment; filename=" + `roomwiseallocation.xlsx`
                        );
            
                        return workbook.xlsx.write(res).then(function () {
                            res.status(200).end();
                        });
        })
    }

}