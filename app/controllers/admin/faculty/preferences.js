const {
    check,
    oneOf,
    validationResult
} = require('express-validator');
const SlotIntervalTimings = require('../../../models/SlotIntervalTimings')
const FacultyWorks = require('../../../models/FacultyWorks')
const ProgramDays = require('../../../models/ProgramDays')
const FacultyWorkTimePreferences = require('../../../models/FacultyWorkTimePreferences')
const Settings = require("../../../models/Settings");
const Programs = require('../../../models/Programs')
const isJsonString = require('../../../utils/util')
const excel = require("exceljs");

module.exports = {
    getPage: (req, res) => {
        Promise.all([FacultyWorkTimePreferences.fetchAll(10, res.locals.slug), SlotIntervalTimings.forFaculty(1000), FacultyWorkTimePreferences.getCount(res.locals.slug), FacultyWorkTimePreferences.facultyPrefList(res.locals.slug), Programs.fetchAll(100, res.locals.slug)]).then(result => {
            res.render('admin/faculty/preference', {
                facultyworktimepref: result[0].recordset,
                slotIntervalTimings: result[1].recordset,
                pageCount: result[2].recordset ? result[2].recordset[0].count : 0,
                breadcrumbs: req.breadcrumbs,
                facultyList: result[3].recordset,
                programList : result[4].recordset
            })
        })
    },

    create: (req, res) => {

        let object = {
            add_faculty_work_time_preferences: JSON.parse(req.body.inputJSON)
        }

        FacultyWorkTimePreferences.save(object, res.locals.slug, res.locals.userId).then(result => {
            if (req.body.settingName) {
                Settings.updateByName(res.locals.slug, req.body.settingName)
            }
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

    search: (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        FacultyWorkTimePreferences.search(req.body, res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Holiday fetched",
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
            res.json({
                status: "500",
                message: "Something went wrong",
            })
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

        FacultyWorkTimePreferences.pagination(req.body.pageNo, res.locals.slug).then(result => {
            res.json({
                status: "200",
                message: "Holiday fetched",
                data: result.recordset,
                length: result.recordset.length
            })
        }).catch(error => {
            console.log(error)
            throw error
        })
    },


    update: (req, res) => {

        let object = {
            update_faculty_work_time_preferences: JSON.parse(req.body.inputJSON)
        }

        FacultyWorkTimePreferences.update(object, res.locals.slug, res.locals.userId).then(result => {
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

    delete: (req, res) => {
        console.log('BODY::::::::::::>>>>>>', req.body.id)
        FacultyWorkTimePreferences.delete(req.body.id, res.locals.slug, res.locals.userId).then(result => {
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



    getSlotsByIdAndPrograms: (req, res, next) => {
        console.log('BODY:::::::::', req.body.facultyId)
        Promise.all([SlotIntervalTimings.getFacultySlotsById(req.body.facultyDboLId, res.locals.slug), FacultyWorkTimePreferences.programByFacultyId(req.body.faculty_lid, res.locals.slug)]).then(result => {
            console.log('result::::::::123', result[1].recordset)
            res.json({
                status: 200,
                message: "Success",
                slotList: result[0].recordset,
                programList: result[1].recordset
            })
        }).catch(error => {
            console.log(error)
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




    moduleByprogramAndSessionId: (req, res, next) => {
       FacultyWorkTimePreferences.moduleByprogramAndSessionId(req.body, res.locals.slug).then(result => {
            res.json({
                status: 200,
                message: "Success",
                result: result.recordset,
            })
        }).catch(error => {
            console.log(error)
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

    sessionDayByProgramId: (req, res, next) => {
        Promise.all([FacultyWorks.sessionListByProgram(req.body.programId, res.locals.slug), ProgramDays.dayByProgramId(req.body.programId, res.locals.slug)]).then(result => {
            console.log('Result:::::::::::::::', result)
            res.json({
                status: 200,
                message: "Success",
                sessonList: result[0].recordset,
                dayList: result[1].recordset,
            })
         }).catch(error => {
             console.log(error)
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

     facultyWorkloadForPrefernce: (req, res, next) => {
        FacultyWorks.facultyWorkloadForPrefernce(req.body, res.locals.slug).then(result => {
            console.log('Result:::::::::::::::', result)
            res.json({
                status: 200,
                message: "Success",
                worklist: result.recordset,
            })
         }).catch(error => {
             console.log(error)
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

     findOne: (req, res) => {
        console.log('req body time preference::', req )
        FacultyWorkTimePreferences.findOne(req.body.id, res.locals.slug).then(result => {
            console.log('result:: time preference::', result)
            res.json({
                status: 200,
                message: "Success",
                result: result.recordset[0]
            })
        }).catch(error => {
            console.log('error::::::::',error)
            res.status(500).json(error.originalError.info.message)
        })
    },

    downloadMaster: async(req, res, next) => {
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet('Faculty Preference Master');
        worksheet.columns = [
          { header: "Faculty ID", key: "faculty_id", width: 10 },
          { header: "Faculty Name", key: "faculty_name", width: 25 },
          { header: "Faculty Type", key: "faculty_type", width: 25 },
          { header: "Start Time", key: "start_time", width: 25 },
          { header: "End Time", key: "end_time", width: 25 },
          { header: "Program Name", key: "program_name", width: 25 },
          { header: "Program Code", key: "program_code", width: 25 },
          { header: "Program ID", key: "program_id", width: 25 },
          { header: "Day", key: "day", width: 25 },
          { header: "Module Name", key: "module_name", width: 25 },
          { header: "Module Code", key: "module_code", width: 25 },
          { header: "Module ID", key: "module_id", width: 25 },
          { header: "Academic Session", key: "acad_session", width: 25 }
        ];

       FacultyWorkTimePreferences.downloadExcel(res.locals.slug).then(result => {
            // Add Array Rows
            worksheet.addRows(result.recordset);
            // res is a Stream object
            res.setHeader(
              "Content-Type",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
              "Content-Disposition",
              "attachment; filename=" + "FacultPreferenceMaster.xlsx"
            );
            return workbook.xlsx.write(res).then(function () {
              res.status(200).end();
            });
        })
    },


    showEntries:(req, res, next)=>{
        FacultyWorkTimePreferences.fetchAll(req.body.rowcount, res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Work fetched",
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
            res.json({
                status: "500",
                message: "Something went wrong",
            })
        })
    },

    getProgramFacultyId: (req, res, next) => {
        console.log('BODY:::::::::', req.body)
        FacultyWorkTimePreferences.fetchByFacultyId(req.body.faculty_lid, res.locals.slug).then(result => {
            console.log('result::::::::',result.recordset)
            res.json({
                status: 200,
                message: "Success",
                facultylist: result.recordset
            })
        }).catch(error => {
            console.log(error)
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

    findByProgramId:  (req, res, next) => {
        Promise.all([FacultyWorkTimePreferences.byProgramId(req.body.program_lid, res.locals.slug), FacultyWorkTimePreferences.distinctSession(req.body.program_lid, res.locals.slug)]).then(result => {
            res.json({
                status: 200,
                message: "Success",
                programlist: result[0].recordset,
                sessionlist: result[1].recordset
            })
        }).catch(error => {
            console.log(error)
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

    findByProgramSessionId:  (req, res, next) => {
        console.log('req.body:::::::::::::',req.body)
        FacultyWorkTimePreferences.findByProgramSessionId(req.body, res.locals.slug).then(result => {
            console.log('result::::::::::::',result)
            res.json({
                status: 200,
                message: "Success",
                data: result.recordset,
            })
        }).catch(error => {
            console.log(error)
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