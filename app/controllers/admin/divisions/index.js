const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const Divisions = require('../../../models/Divisions')
const Settings = require('../../../models/Settings')
const CourseWorkload = require('../../../models/CourseWorkload')
const Programs = require('../../../models/Programs')
const isJsonString = require('../../../utils/util')
const excel = require("exceljs");


module.exports = {
    getPage: (req, res) => {
        let slugName = res.locals.slug;
        Promise.all([Divisions.fetchAll(10000, slugName), Divisions.getCount(slugName), CourseWorkload.fetchAll(1000, slugName), Programs.fetchAll(10000, slugName)]).then(result => {
            console.log('PROGRAM Result::::::::',result[3].recordset)
            res.render('admin/divisions/index', {
                divisionList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                moduleList: result[2].recordset,
               programList: result[3].recordset,
                breadcrumbs: req.breadcrumbs,
            })
        })
    },

    getUniqueDiv: (req, res, next) => {
        console.log('req body for div', req.body)
        Divisions.getUniqueDiv(res.locals.slug, req.body.programLid, req.body.sessionLid).then(result => {
            console.log('Unique division list:::', result.recordset)
            res.status(200).send(result.recordset)
        })
    },


    getAll: (req, res) => {
        Divisions.fetchAll(10, res.locals.slug).then(result => {
            res.status(200).json({
                status: 200,
                result: result.recordset
            })
        })
    },

    search: (req, res) => {
        let rowcount = 10000;
        Divisions.search(rowcount, req.body.keyword, res.locals.slug).then(result => {
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

        Divisions.pagination(req.body.pageNo, res.locals.slug).then(result => {
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

    changestatus: (req, res) => {
        Divisions.changeStatus(req.body, res.locals.slug).then(result => {
            res.json({
                status: "200",
                message: "Success",
            })
        }).catch(error => {
            throw error
        })
    },

    update: (req, res) => {
        let object = {
            update_divisions: JSON.parse(req.body.inputJSON)
        }

        console.log('userid::::::::::>>>>>><><<<<', res.locals.userId)
        Divisions.update(object, res.locals.slug, res.locals.userId).then(result => {

            //IF ROOM APPLILICED ACCESSFULLY THEN NEED TO UPDATE SETTING TABLE DATA
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

    // Generate Division
    generateDivision: (req, res) => {
        console.log('Refresh Divisions::::::::>>')
        Divisions.generateDivision(res.locals.slug, res.locals.userId).then(result => {
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
        Divisions.delete(req.body.id, res.locals.slug, res.locals.userId).then(result => {
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


    divisionByModuleId: (req, res) => {
        Divisions.divisionByModuleId(req.body, res.locals.slug).then(result => {
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


    divisionByProgramId: (req, res) => {
        console.log('REQ::::',req.body)
        Promise.all([Divisions.divisionByProgramId(req.body.programid, res.locals.slug), CourseWorkload.getmoduleByProgramId(req.body.program_id, res.locals.slug)]).then(result => {
            console.log('result::::::::::', result[0])
            res.json({
                status: "200",
                message: "success",
                division: result[0].recordset,
                moduleList: result[1].recordset,
            })
        }).catch(error => {
            console.log('error::::::::::::::', error)
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
        let worksheet = workbook.addWorksheet('Division Master');
        worksheet.columns = [
          { header: "Program Name", key: "program_name", width: 10 },
          { header: "Program Code", key: "program_code", width: 25 },
          { header: "Program ID", key: "program_id", width: 25 },
          { header: "Module Name", key: "module_name", width: 25 },
          { header: "Module Code", key: "module_code", width: 25 },
          { header: "Module ID", key: "module_id", width: 25 },
          { header: "Division", key: "division", width: 25 },
          { header: "Academic Session", key: "acad_session", width: 25 },
          { header: "Student Count", key: "student_count", width: 25 },
          { header: "Count For Theory Batch", key: "count_for_theory_batch", width: 25 },
          { header: "Count For Practical Batch", key: "count_for_practical_batch", width: 25 },
          { header: "Count For Tutorial Batch", key: "count_for_tutorial_batch", width: 25 },
          { header: "Count For Workshop Batch", key: "count_for_workshop_batch", width: 25 }
        ];

        Divisions.downloadExcel(res.locals.slug).then(result => {
            // Add Array Rows
            worksheet.addRows(result.recordset);
            // res is a Stream object
            res.setHeader(
              "Content-Type",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
              "Content-Disposition",
              "attachment; filename=" + "DivisionMaster.xlsx"
            );
            return workbook.xlsx.write(res).then(function () {
              res.status(200).end();
            });
        })
    },

    showEntries:(req, res, next)=>{
        Divisions.fetchAll(req.body.rowcount, res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "fetched",
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