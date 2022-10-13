const TimeTable = require('../../../models/TimeTable');
const AcademicYear = require('../../../models/AcademicYear');
const AcademicCalender = require('../../../models/AcademicCalender');
const ProgramSessions = require('../../../models/ProgramSessions');
const SchoolTimings = require('../../../models/SchoolTiming');
const SlotIntervalTiming = require('../../../models/SlotIntervalTimings')
const Rooms = require('../../../models/Rooms');
const Days = require('../../../models/Days');
const Mis = require('../../../models/Mis');
const isJsonString = require('../../../utils/util')
const excel = require("exceljs");
module.exports = {

    getPage: (req, res) => {
        console.log('Hitting get page', )
        Promise.all([
                ProgramSessions.getLockedProgram(res.locals.slug),
                Rooms.fetchBookedRooms(res.locals.organizationId, res.locals.slug),
                Days.fetchActiveDay(res.locals.slug),
                TimeTable.getPendingEventPrograms(res.locals.slug),
                SlotIntervalTiming.slotTimesForSchoolTiming(res.locals.slug),
                TimeTable.getPendingEvents(res.locals.slug)
            ])
            .then(result => {
                //console.log('pending event list list::::', result[5].recordset)
                res.render('admin/timeTableSimulation/timetable', {
                    programList: result[0].recordset,
                    programListJson: JSON.stringify(result[0].recordset),
                    roomListStr: result[1].recordset,
                    roomList: JSON.stringify(result[1].recordset),
                    dayList: result[2].recordset,
                    pendingEventPrograms: JSON.stringify(result[3].recordset),
                    timeSlotList: JSON.stringify(result[4].recordset),
                    pendingEventList: JSON.stringify(result[5].recordset),

                    breadcrumbs: req.breadcrumbs,
                    Url: req.originalUrl
                })
            }).catch(error => {
                console.log('error', error)
            })
    },

    getAcadCalenderEvnt: (req, res, next) => {
        AcademicCalender.fetchAll(10000).then(result => {
            console.log(JSON.stringify(result.recordset))
            res.status(200).send(result.recordset)
        })

    },

    getSessionByProgram: (req, res, next) => {
        ProgramSessions.getLockedSessionByProgram(res.locals.slug, req.body.program_lid).then(result => {
            res.status(200).send(result.recordset)
        })
    },

    getEventsByProgramSessionDay: (req, res, next) => {
        console.log('req::::::::::::>', req.body)
        Promise.all([
            TimeTable.getEventsByProgramSessionDay(res.locals.slug, req.body.dayLid, req.body.programLid, req.body.acadSessionLid),
            TimeTable.getEventsByProgramSessionDay(res.locals.slug, req.body.dayLid),
            SchoolTimings.getTimeTableSimulationSlots(res.locals.slug, req.body.dayLid, req.body.programLid, req.body.acadSessionLid),
        ]).then(results => {
            console.log('Event results::::::::::', results[0])
            res.status(200).send({
                eventList: results[0].recordset,
                allEventList: results[1].recordset,
                slotList: results[2].recordset,

            })
        })
    }, 

    getPendingEvents: (req, res, next) => {
        console.log('pending req', req.body)
        TimeTable.getPendingEvents(res.locals.slug, req.body.programLid, req.body.acadSessionLid).then(result => {
            console.log('pending list:::', result.recordset)
            res.status(200).send(result.recordset)
        })
    },

    getPendingEventSessions: (req, res, next) => {
        console.log('pending req', req.body)
        TimeTable.getPendingEventSessions(res.locals.slug, req.body.programLid).then(result => {
            console.log('pending event session list:::', result.recordset)
            res.status(200).send(result.recordset)
        })
    },

    getPendingEventModule: (req, res, next) => {
        console.log('pending req', req.body)
        TimeTable.getPendingEventModule(res.locals.slug, req.body.programLid, req.body.sessionLid).then(result => {
            console.log('pending event session list:::', result.recordset)
            res.status(200).send(result.recordset)
        })
    },

    getDivAllocation: (req, res, next) => {
        console.log('division wise allocation', req.body)
        TimeTable.getDivAllocation(res.locals.slug, req.body.programLid, req.body.sessionLid, req.body.divisionName).then(result => {
          //  console.log('division allocation list:::', result.recordset)
            res.status(200).json({status:200, result: result.recordset})
        })
    },

    getDivAllocationPage: (req, res, next) => {
        console.log('pending req', req.body)
        Promise.all([
            ProgramSessions.getLockedProgram(res.locals.slug),
            
            Days.fetchAll(10, res.locals.slug),
            SlotIntervalTiming.slotTimesForSchoolTiming(res.locals.slug),
           
        ]).then(result => {
            res.render('admin/timeTableSimulation/divisionallocationstatus', {
                programList: result[0].recordset,
                programListJson: JSON.stringify(result[0].recordset),
                dayList: JSON.stringify(result[1].recordset),
                timeSlotList:JSON.stringify(result[2].recordset),
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })
    },


    //Implemented in timetablesocket
    dropEvent: (req, res, next) => {
        console.log(req.body);
        TimeTable.dropEvent(res.locals.slug, res.locals.userId, req.body.eventLid).then(result => {
            res.status(200).send(result);
        })
    },

    //Implemented in timetablesocket
    scheduleEvent: (req, res) => {
        let object = {
            allocate_events: JSON.parse(req.body.inputJSON)
        }

        TimeTable.scheduleEvent(res.locals.slug, res.locals.userId, object).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            if (isJsonString.isJsonString(error.originalError.info.message)) {
                res.status(500).json(JSON.parse(error.originalError.info.message))
            } else {
                res.status(500).json({
                    status: 500,
                    description: error.originalError.info.message,
                    data: []
                })
            }
        })
    },


    //Implemented in timetablesocket
    swapEvents: (req, res) => {
        let object = {
            "swap_events": JSON.parse(req.body.inputJSON)
        }

        TimeTable.swapEvents(res.locals.slug, res.locals.userId, object).then(result => {
            console.log('successfully swaped', result)
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            console.log('error::::::', error);
            if (isJsonString.isJsonString(error.originalError.info.message)) {
                res.status(500).json(JSON.parse(error.originalError.info.message))
            } else {
                res.status(500).json({
                    status: 500,
                    description: error.originalError.info.message,
                    data: []
                })
            }
        })
    },



    allocateFaculties: (req, res) => {
        console.log('faculty allocation request', req.body)
        TimeTable.allocateFaculties(res.locals.slug, req.body).then(result => {

            res.status(200).json({
                description: "Successful!"
            })
        })
    },

    deallocateFaculties: (req, res) => {
        console.log('faculty deallocation request', req.body)
        TimeTable.deallocateFaculties(res.locals.slug, req.body).then(result => {

            res.status(200).json({
                description: "Successful!"
            })
        })
    },

    downloadMaster: async (req, res, next) => {
        let workbook = new excel.Workbook();
        let Allocatedworksheet = workbook.addWorksheet('Allocated Event');
        let UnAllocatedworksheet = workbook.addWorksheet('UnAllocated Event');
        let timeTablePivotedworksheet = workbook.addWorksheet('Time Table Pivoted');
        let facultyDayWiseWorksheet = workbook.addWorksheet('Faculty Day Wise');


        Allocatedworksheet.columns = [{
                header: "Room Number",
                key: "room_number",
                width: 10
            },
            {
                header: "Room Type",
                key: "room_type",
                width: 10
            },
            {
                header: "Day",
                key: "day_name",
                width: 25
            },
            {
                header: "Program Name",
                key: "program_name",
                width: 25
            },
            {
                header: "Program Code",
                key: "program_code",
                width: 25
            },
            {
                header: "Program ID",
                key: "program_id",
                width: 25
            },
            {
                header: "Academic Session",
                key: "acad_session",
                width: 25
            },
            {
                header: "Module Name",
                key: "module_name",
                width: 25
            },
            {
                header: "Module Code",
                key: "module_code",
                width: 25
            },
            {
                header: "Module ID",
                key: "module_id",
                width: 25
            },
            {
                header: "Division",
                key: "division",
                width: 25
            },
            {
                header: "Start Time",
                key: "start_time",
                width: 25
            },
            {
                header: "End Time",
                key: "end_time",
                width: 25
            },
            {
                header: "Event Name",
                key: "event_type_name",
                width: 25
            },
            {
                header: "Faculty ID",
                key: "faculty_id",
                width: 25
            },
            {
                header: "Faculty Name",
                key: "faculty_name",
                width: 25
            },
            {
                header: "Faculty Type",
                key: "faculty_type",
                width: 25
            },
        ];

        UnAllocatedworksheet.columns = [{
                header: "Program Name",
                key: "program_name",
                width: 25
            },
            {
                header: "Program Code",
                key: "program_code",
                width: 25
            },
            {
                header: "Program ID",
                key: "program_id",
                width: 25
            },
            {
                header: "Academic Session",
                key: "acad_session",
                width: 25
            },
            {
                header: "Module Name",
                key: "module_name",
                width: 25
            },
            {
                header: "Module Code",
                key: "module_code",
                width: 25
            },
            {
                header: "Module ID",
                key: "module_id",
                width: 25
            },
            {
                header: "Module Type",
                key: "module_type",
                width: 25
            },
            {
                header: "Division",
                key: "division",
                width: 25
            },
            {
                header: "Event Type",
                key: "event_type",
                width: 25
            },
            {
                header: "Faculty ID",
                key: "faculty_id",
                width: 25
            },
            {
                header: "Faculty Name",
                key: "faculty_name",
                width: 25
            },
            {
                header: "Faculty Type",
                key: "faculty_type",
                width: 25
            },
        ];

        timeTablePivotedworksheet.columns = [
            {
                header: "Program Name",
                key: "program_name",
                width: 25
            },
            {
                header: "Academic Session",
                key: "acad_session",
                width: 25
            },
            {
                header: "Division",
                key: "division",
                width: 25
            },
            {
                header: "Start Time",
                key: "start_time",
                width: 25
            },
            {
                header: "End Time",
                key: "end_time",
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

        facultyDayWiseWorksheet.columns = [
            {
                header: "Faculty Id",
                key: "faculty_id",
                width: 25
            },
            {
                header: "Faculty Name",
                key: "faculty_name",
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

        //facultyDayWise
        Promise.all([TimeTable.AllocatedEventExcel(res.locals.slug), TimeTable.unAllocatedEventExcel(res.locals.slug), TimeTable.timeTablePivotedExcel(res.locals.slug), Mis.facultyDayWise(res.locals.slug, 0)]).then(result => {
            // Add Array Rows
            console.log('result[3].recordset::::::::::::',result[3].recordset)
            Allocatedworksheet.addRows(result[0].recordset);
            UnAllocatedworksheet.addRows(result[1].recordset);
            timeTablePivotedworksheet.addRows(result[2].recordset);
            facultyDayWiseWorksheet.addRows(result[3].recordset)
            // res is a Stream object
            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=" + `TimeTableMaster.xlsx`
            );

            return workbook.xlsx.write(res).then(function () {
                res.status(200).end();
            });
        })
    }
}