const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const FacultyWorks = require('../../../models/FacultyWorks')
const Faculties = require('../../../models/Faculties')
const ProgramSessions = require('../../../models/ProgramSessions')
const CourseWorkload = require('../../../models/CourseWorkload')
const Settings = require("../../../models/Settings");
const Programs = require("../../../models/programs");
const isJsonString = require('../../../utils/util')
const excel = require("exceljs");


module.exports = {
    getPage: (req, res) => {
        const slug = res.locals.slug;
        Promise.all([FacultyWorks.fetchAll(10, slug), FacultyWorks.getCount(slug), Faculties.fetchAll(1000, slug), Programs.fetchAll(100, slug), CourseWorkload.fetchAll(10000, slug)]).then(result => {
            res.render('admin/faculty/facultyworks', {
                facultyWorkList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                facultyList: result[2].recordset,
                programList: result[3].recordset,
                courseWorkload: result[4].recordset,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })
    },

    create: (req, res) => {

        let object = {
            add_faculty_works: JSON.parse(req.body.inputJSON)
        }

        console.log('FACULTY WORK::::::::::::::::::::>>', object)
        FacultyWorks.save(object, res.locals.slug, res.locals.userId).then(result => {
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

        FacultyWorks.search(req.body, res.locals.slug).then(result => {
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

        FacultyWorks.pagination(req.body.pageNo, res.locals.slug).then(result => {
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
            update_faculty_works: JSON.parse(req.body.inputJSON)
        }

        FacultyWorks.update(object, res.locals.slug, res.locals.userId).then(result => {
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
        console.log('Delete::::::::::::>>', req.body.id)
        FacultyWorks.delete(req.body.id, res.locals.slug, res.locals.userId).then(result => {
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

    sessionByProgramId: (req, res) => {
        FacultyWorks.sessionListByProgram(req.body.program_lid, res.locals.slug).then(result => {
            console.log('result in controller', result)
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Session List",
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
            // if (isJsonString.isJsonString(error.originalError.info.message)) {
            //     res.status(500).json(JSON.parse(error.originalError.info.message))
            // } else {
            //     res.status(500).json({
            //         status: 500,
            //         description: error.originalError.info.message,
            //         data: []
            //     })
            // }
            console.log('errooor', error);
        })
    },

    moduleByprogramSession: (req, res) => {
        console.log('request body in controller', req.body)
        FacultyWorks.moduleByProgramSession(req.body, res.locals.slug).then(result => {
            console.log('result in controller', result)
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Session List",
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
            // if (isJsonString.isJsonString(error.originalError.info.message)) {
            //     res.status(500).json(JSON.parse(error.originalError.info.message))
            // } else {
            //     res.status(500).json({
            //         status: 500,
            //         description: error.originalError.info.message,
            //         data: []
            //     })
            // }
            console.log('errooor', error);
        })
    },

    findOne: (req, res) => {
        FacultyWorks.findOne(req.body.Id, res.locals.slug).then(result => {
            res.json({
                status: 200,
                data: result.recordset[0]
            })
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },


    changeStatus: (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }
        FacultyWorks.changePreferenceStatus(req.body, res.locals.slug, res.locals.userId).then(result => {
            res.status(200).json({
                status: 200,
                message: "Success"
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

    getAll: (req, res) => {
        FacultyWorks.fetchAll(10, res.locals.slug).then(result => {
            res.status(200).json({
                result: result.recordset
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

    getFacultyWorks: (req, res) => {

        console.log('fetching faculties:>>>>>>>>>>> ', req.body)

        Promise.all([FacultyWorks.facultyWorkEvents(req.body, res.locals.slug), FacultyWorks.getFacultiesAllocationDetails(req.body, res.locals.slug)])
        .then(result => {

            console.log('Result>>> ' , result[0].recordset)

            res.status(200).json({
                result: result[0].recordset,
                facultyAllocationDetails: result[1].recordset
            })
        }).catch(error => {
            // if (isJsonString.isJsonString(error.originalError.info.message)) {
            //     res.status(500).json(JSON.parse(error.originalError.info.message))
            // } else {
            //     res.status(500).json({
            //         status: 500,
            //         description: error.originalError.info.message,
            //         data: []
            //     })
            // }
            console.log(error, 'errr')
        })
    },

    downloadMaster: async(req, res, next) => {
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet('Faculty Work Master');
        worksheet.columns = [
          { header: "Faculty ID", key: "faculty_id", width: 10 },
          { header: "Faculty Name", key: "faculty_name", width: 25 },
          { header: "Faculty Type", key: "faculty_type", width: 25 },
          { header: "Program Name", key: "program_name", width: 30 },
          { header: "Program Code", key: "program_code", width: 25 },
          { header: "Module Name", key: "module_name", width: 30 },
          { header: "Module Code", key: "module_code", width: 25 },
          { header: "Module Id", key: "module_id", width: 25 },
          { header: "Academic Session", key: "acad_session", width: 25 },
          { header: "Lecture Per Week", key: "lecture_per_week", width: 25 },
          { header: "Practical Per Week", key: "practical_per_week", width: 25 },
          { header: "Tutorial Per Week", key: "tutorial_per_week", width: 25 },
          { header: "Workshop Per Week", key: "workshop_per_week", width: 25 },
          { header: "Batch Preference", key: "is_batch_preference_set_status", width: 10 }
        ];

        FacultyWorks.downloadExcel(res.locals.slug).then(result => {
            // Add Array Rows
            worksheet.addRows(result.recordset);
            // res is a Stream object
            res.setHeader(
              "Content-Type",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
              "Content-Disposition",
              "attachment; filename=" + "FacultyWorkMaster.xlsx"
            );
            return workbook.xlsx.write(res).then(function () {
              res.status(200).end();
            });
        })
    },

    showEntries:(req, res, next)=>{
        FacultyWorks.fetchAll(req.body.rowcount, res.locals.slug).then(result => {
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

    allocationFaculties:(req, res, next)=>{
        FacultyWorks.getFacultiesAllocationDetails(req.body.rowcount, res.locals.slug).then(result => {
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
    }

}