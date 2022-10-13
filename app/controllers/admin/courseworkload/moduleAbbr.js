const {
    check,
    oneOf,
    validationResult
} = require('express-validator');
const CourseWorkload = require('../../../models/CourseWorkload')
const AcadYear = require('../../../models/AcademicYear')
const Programs = require('../../../models/Programs')
const AcadSession = require('../../../models/AcadSession')
const ModuleType = require('../../../models/ModuleType')
const Settings = require('../../../models/Settings');
const path = require("path");
var soap = require("soap");
const isJsonString = require('../../../utils/util')
const excel = require("exceljs");



module.exports = {
    getPage: (req, res) => {
        Promise.all([CourseWorkload.getAll(res.locals.slug), CourseWorkload.getCount(res.locals.slug), AcadYear.fetchAll(), Programs.fetchAll(100, res.locals.slug), AcadSession.fetchAll(1000), ModuleType.fetchAll(1000, res.locals.slug)]).then(result => {
            res.render('admin/courseworkload/abbr_update', {
                courseWorkloadList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                acadYear: result[2].recordset[0].input_acad_year,
                programList: result[3].recordset,
                AcadSessionList: result[4].recordset,
                moduleList: result[5].recordset,
                breadcrumbs: req.breadcrumbs,
                moduleListAjax: JSON.stringify(result[5].recordset)
            })
        })
    },



    changestatus: (req, res) => {
        CourseWorkload.changeStatus(req.body, res.locals.slug).then(result => {
            res.json({
                status: "200",
                message: "Success",
            })
        }).catch(error => {
            throw error
        })
    },

    getAll: (req, res) => {
        CourseWorkload.fetchAll(10, res.locals.slug).then(result => {
            res.status(200).json({
                status: 200,
                result: result.recordset
            })
        })
    },

    search: (req, res) => {
        let rowcount = 10;
        CourseWorkload.search(rowcount, req.body.keyword, res.locals.slug).then(result => {
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
            res.status(500).json(error.originalError.info.message)
        })
    },

    pagination: (req, res, ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        CourseWorkload.pagination(req.body.pageNo, res.locals.slug).then(result => {
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
            update_module_event_abbr: JSON.parse(req.body.inputJSON)
        }
        console.log('COURSE WORKLOAD ABBR  INPUT JSON:::::::::::::::::>>>>', object)
        CourseWorkload.updateAbbr(object, res.locals.slug, res.locals.userId).then(result => {
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






    sessionByProgramIdWSDL: (req, res) => {
        CourseWorkload.sessionByProgramIdWSDL(req.body.programId, res.locals.slug).then(result => {
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


    courseBySessionIdAndProgramId: (req, res) => {
        CourseWorkload.courseBySessionIdAndProgramId(req.body, res.locals.slug).then(result => {
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

    workloadByProgramId: (req, res) => {
        Promise.all([CourseWorkload.workloadByProgramId(req.body.programId, res.locals.slug), CourseWorkload.sessionByProgramId(req.body.programId, res.locals.slug)]).then(result => {
            console.log('req.body:::::::::::::', result)
            res.json({
                status: "200",
                message: "Sucessfull",
                workload: result[0].recordset,
                sessionList: result[1].recordset
            })
        }).catch(error => {
            console.log(error)
            res.status(500).json(error.originalError.info.message)
        })
    },

    workloadByProgramIdSessionId: (req, res) => {
        CourseWorkload.workloadByProgramIdSessionId(req.body, res.locals.slug).then(result => {
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


    showEntries: (req, res, next) => {
        CourseWorkload.getAllWithLimit(req.body.rowcount, res.locals.slug).then(result => {
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