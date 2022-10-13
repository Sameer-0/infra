const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const CourseDayRoomPreferences = require('../../../models/CourseDayRoomPreferences');
const Programs = require('../../../models/Programs');
const Days = require('../../../models/Days');
const RoomSlots = require('../../../models/RoomSlots')
const isJsonString = require('../../../utils/util')
const RoomTypes = require('../../../models/RoomTypes')
const RoomTransactions = require('../../../models/RoomTransactions')
const CourseWorkload = require('../../../models/CourseWorkload')
const AcadSession = require('../../../models/AcadSession')
const Divisions = require('../../../models/Divisions')

module.exports = {


    getPage: (req, res) => {
        Promise.all([Days.fetchAll(10, res.locals.slug), CourseDayRoomPreferences.icwForPreference(res.locals.slug), RoomTransactions.roomsForCoursePreferences(res.locals.slug), Programs.fetchAll(100, res.locals.slug), AcadSession.sessionForCoursePreferences(res.locals.slug), CourseWorkload.fetchAll(1000,res.locals.slug), Divisions.getAll(res.locals.slug)]).then(result => {
            res.render('admin/courseworkload/preference', {
                dayList: result[0].recordset,
                icwList: result[1].recordset,
                roomLists: result[2].recordset,
                programList: result[3].recordset,
                breadcrumbs: req.breadcrumbs,
                dayListJSON: JSON.stringify(result[0].recordset),
                roomListsJSON: JSON.stringify(result[2].recordset),
                acadSession: result[4].recordset,
                courseList : result[5].recordset,
                divisionList : result[6].recordset
            })
        })
    },

    create: (req, res) => {
        let object = {
            set_course_day_room_preferences: JSON.parse(req.body.inputJSON)
        }
        CourseDayRoomPreferences.save(object, res.locals.slug, res.locals.userId).then(result => {
            console.log('success course prefernce::>>', result)
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            console.log('error:::::::::::::::::::>>>', error)
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

    search: (req, res) => {
        let rowcount = 10;
        CourseDayRoomPreferences.search(req.body.keyword, res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Room Type fetched",
                    data: result.recordset,
                    length: result.recordset.length

                })
            } else {
                res.json({
                    status: "400",
                    message: "No data found",
                    data: result.recordset,
                    length: result.recordset.length
                })
            }
        }).catch(error => {
            console.log(error)
            res.status(500).json(error.originalError.info.message)
        })
    },

    pagination: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        console.log('hitting pagination')
        CourseDayRoomPreferences.pagination(req.body.pageNo, res.locals.slug).then(result => {
            res.json({
                status: "200",
                message: "Quotes fetched",
                data: result.recordset,
                length: result.recordset.length
            })
        }).catch(error => {
            throw error
        })
    },

    update: (req, res) => {

        let object = {
            update_faculty_date_times: JSON.parse(req.body.inputJSON)
        }

        CourseDayRoomPreferences.update(object, res.locals.slug, res.locals.userId).then(result => {
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

    acadSessionList: (req, res) => {
        Promise.all([CourseDayRoomPreferences.getAcadSessionList(JSON.parse(req.body.array), res.locals.slug), CourseDayRoomPreferences.getDayName(req.body.program_lid, res.locals.slug)])
            .then(result => {
                res.json({
                    status: 200,
                    data: {
                        acadSessionList: result[0].recordset,
                        dayList: result[1].recordset
                    }
                })

            })
    },

    courseList: (req, res) => {
        console.log('req.body::::::::::::::::::::', req.body)
        CourseDayRoomPreferences.getCourseList(req.body, res.locals.slug).then(result => {
            res.json({
                status: 200,
                data: result.recordset
            })

        })
    },

    divList: (req, res) => {
        CourseDayRoomPreferences.getDivList(req.body, res.locals.slug).then(result => {
            res.json({
                status: 200,
                data: result.recordset
            })
        })
    },

    refresh: (req, res) => {
        CourseDayRoomPreferences.refresh(res.locals.slug).then(result => {
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




    batchByDivisionId: (req, res) => {
        console.log('Array::::::::::::', JSON.parse(req.body.array))
        CourseDayRoomPreferences.batchByDivisionId(JSON.parse(req.body.array), res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Division Name",
                    result: result.recordset,
                    length: result.recordset.length
                })
            } else {
                res.json({
                    status: "400",
                    message: "No data found",
                    result: result.recordset,
                    length: result.recordset.length
                })
            }
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

    findSemesterByProgramId: (req, res) => {
        Promise.all([CourseDayRoomPreferences.findSemesterByProgramId(req.body.programId, res.locals.slug), CourseDayRoomPreferences.preferenceByProgramId(req.body.programId, res.locals.slug)]).then(result => {
            res.json({
                status: "200",
                message: "Semester Found",
                result: result[0].recordset,
                length: result[0].recordset.length,
                tabledata: result[1].recordset
            })
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

    findModuleByProgramIdSemId: (req, res) => {
        console.log('req.body::::::::::::',req.body)
        Promise.all([CourseDayRoomPreferences.findModuleByProgramIdSemId(req.body, res.locals.slug), CourseDayRoomPreferences.preferenceByProgramIdSessionId(req.body, res.locals.slug)]).then(result => {
                res.json({
                    status: "200",
                    message: "Semester Found",
                    result: result[0].recordset,
                    length: result[0].recordset.length,
                    tabledata: result[1].recordset
                })
            })
            .catch(error => {
                console.log('error::::::::::::::',error)
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

    findDivisionByModuleId: (req, res) => {
        Promise.all([CourseDayRoomPreferences.findDivisionByModuleId(req.body.moduleLid, res.locals.slug), CourseDayRoomPreferences.preferenceByModuleId(req.body.moduleLid, res.locals.slug)]).then(result => {
                res.json({
                    status: "200",
                    message: "Divison Found",
                    result: result[0].recordset,
                    length: result[0].recordset.length,
                    tabledata: result[1].recordset
                })
            })
            .catch(error => {
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

    filterPreference: (req, res) => {
        CourseDayRoomPreferences.searchPreferences(req.body, res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Sucessfull",
                    data: result.recordset,
                    length: result.recordset.length

                })
            } else {
                res.json({
                    status: "400",
                    message: "No data found",
                    data: result.recordset,
                    length: result.recordset.length
                })
            }
        }).catch(error => {
            console.log(error)
            res.status(500).json(error.originalError.info.message)
        })
    },

    occupiedRoomDays:(req, res)=>{
        console.log('GET OCCUPIED ROOMS',req.body)
        CourseDayRoomPreferences.occupiedRoomDays(res.locals.slug, req.body).then(result=>{
            console.log('result::::::::::::::::>>>')
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Sucessfull",
                    data: result.recordset,
                    length: result.recordset.length

                })
            } else {
                res.json({
                    status: "400",
                    message: "No data found",
                    data: result.recordset,
                    length: result.recordset.length
                })
            }
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
    }
}