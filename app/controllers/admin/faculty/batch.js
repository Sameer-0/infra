const {
    check,
    oneOf,
    validationResult
} = require('express-validator');


const Faculties = require('../../../models/Faculties');
const FacultyBatch = require('../../../models/FacultyBatch');
const Settings = require("../../../models/Settings");
const DivisionBatches = require('../../../models/DivisionBatches');
const isJsonString = require('../../../utils/util')
const excel = require("exceljs");


module.exports = {

    getPage: (req, res) => {
        Promise.all([FacultyBatch.fetchAll(10, res.locals.slug), FacultyBatch.getCount(res.locals.slug), Faculties.isBatchPrefSet(res.locals.slug), DivisionBatches.fetchDistinctBatches(res.locals.slug)]).then(result => {
           console.log(result[0].recordset)
            res.render('admin/faculty/facultybatch', {
                FacultyBatchList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                facultyList: result[2].recordset,
                batchList: result[3].recordset,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })
    },


    create: (req, res) => {

        let object = {
            add_faculty_batch: JSON.parse(req.body.inputJSON)
        }

        FacultyBatch.save(object, res.locals.slug, res.locals.userId).then(result => {
            // console.log('ujj::>>', result)
            // console.log('bach::>>>', typeof result.output.output_json)
            // console.log('bach::>>>', JSON.parse(result.output.output_json).description)
            if (req.body.settingName) {
                Settings.updateByName(res.locals.slug, req.body.settingName)
            }

            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            console.log('bach::>>>', error)
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

        FacultyBatch.search(req.body, res.locals.slug).then(result => {
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

        FacultyBatch.pagination(req.body.pageNo, res.locals.slug).then(result => {
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
            update_faculty_batches: JSON.parse(req.body.inputJSON)
        }

        FacultyBatch.update(object, res.locals.slug, res.locals.userId).then(result => {
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
        FacultyBatch.delete(req.body.id, res.locals.slug, res.locals.userId).then(result => {
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

    programByFacultyId: (req, res) => {
        FacultyBatch.programByFacultyId(req.body.faculty_lid, res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Faculty Program",
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

    sessionByFacultyProgramId: (req, res) => {
        FacultyBatch.sessionByFacultyProgramId(req.body, res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Faculty Program",
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

    moduleByFaculty: (req, res) => {
        FacultyBatch.moduleNameByFaculty(req.body, res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Module Name",
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


    divisionByModuleId: (req, res) => {
        FacultyBatch.divisionByModuleId(req.body.module_lid, res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Module Name",
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

    batchByDivisionId: (req, res) => {
        FacultyBatch.batchByDivisionId(req.body.division_lid, res.locals.slug).then(result => {
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

    batchByFacultyIdAndBatchId: (req, res) => {
        console.log('req.body::::::::::::::::',req.body)
        FacultyBatch.findFacultyBatchById(req.body.id, res.locals.slug).then(result => {
            // DivisionBatches.findDivisionsByBatchId(result.recordset[0].batch_lid, res.locals.slug).then(batchresult => {
            //     DivisionBatches.findBatchesByDivisionId(batchresult.recordset[0].division_lid, res.locals.slug).then(divresult => {
                    console.log('facult batch result::::::::::::::::::::', result.recordset)
                    if (result.recordset.length > 0) {
                        res.json({
                            status: "200",
                            message: "faculty batch edit",
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
            //     })
            // })
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

    downloadMaster: async(req, res, next) => {
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet('Faculty Date Time Master');
        worksheet.columns = [
          { header: "Faculty ID", key: "faculty_id", width: 10 },
          { header: "Faculty Name", key: "faculty_name", width: 25 },
          { header: "Faculty Type", key: "faculty_type", width: 25 },
          { header: "Division", key: "division", width: 25 },
          { header: "Batch", key: "batch", width: 25 },
          { header: "Event Type", key: "event_type", width: 25 },
          { header: "Program Name", key: "program_name", width: 30 },
          { header: "Program Code", key: "program_code", width: 25 },
          { header: "Program ID", key: "program_id", width: 25 },
          { header: "Module Name", key: "module_name", width: 25 },
          { header: "Module Code", key: "module_code", width: 25 },
          { header: "Module ID", key: "module_id", width: 25 },
          { header: "Academic Session", key: "acad_session", width: 25 }
        ];

        FacultyBatch.downloadExcel(res.locals.slug).then(result => {
            // Add Array Rows
            worksheet.addRows(result.recordset);
            // res is a Stream object
            res.setHeader(
              "Content-Type",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
              "Content-Disposition",
              "attachment; filename=" + "FacultyDateTimeMaster.xlsx"
            );
            return workbook.xlsx.write(res).then(function () {
              res.status(200).end();
            });
        })
    },

    showEntries:(req, res, next)=>{
        console.log('REQ:::::::::', req.body)
        FacultyBatch.fetchAll(req.body.rowcount, res.locals.slug).then(result => {
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