const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const Programs = require('../../../models/Programs')
const ProgramTypes = require('../../../models/programType')
const Settings = require('../../../models/Settings');
const ProgramsDbo = require('../../../models/ProgramsDbo');
const isJsonString = require('../../../utils/util')
const excel = require("exceljs");


module.exports = {

    
    getPage: (req, res) => {

        Promise.all([Programs.fetchAll(10, res.locals.slug), ProgramTypes.fetchAll(100, res.locals.slug), Programs.getCount(res.locals.slug), ProgramsDbo.fetchAll(1000)]).then(result => { console.log('result[0].recordset', result[0].recordset)
            res.render('admin/programs/index', {
                programList: result[0].recordset,
                programTypeList: JSON.stringify(result[1].recordset),
                programTypeListObj:result[1].recordset,
                pageCount: result[2].recordset[0].count,
                programDboList: result[3].recordset,
                breadcrumbs: req.breadcrumbs,
            })
        })
    },

    search: (req, res) => {
        Programs.search(req.body, res.locals.slug).then(result => {
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
            if(isJsonString.isJsonString(error.originalError.info.message)){
                res.status(500).json(JSON.parse(error.originalError.info.message))
            }
            else{
                res.status(500).json({status:500,
                description:error.originalError.info.message,
                data:[]})
            }
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

        Programs.pagination(req.body.pageNo, res.locals.slug).then(result => {
            res.status(200).json({
                status: "200",
                message: "Quotes fetched",
                data: result.recordset,
                length: result.recordset.length
            })
        }).catch(error => {
            if(isJsonString.isJsonString(error.originalError.info.message)){
                res.status(500).json(JSON.parse(error.originalError.info.message))
            }
            else{
                res.status(500).json({status:500,
                description:error.originalError.info.message,
                data:[]})
            }
        })
    },

    findOne: (req, res) => {
        Programs.findOne(req.body.id, res.locals.slug).then(result => {
            res.status(200).json({
                status: 200,
                message: "Success",
                data: result.recordset[0]
            })
        }).catch(error => {
            if(isJsonString.isJsonString(error.originalError.info.message)){
                res.status(500).json(JSON.parse(error.originalError.info.message))
            }
            else{
                res.status(500).json({status:500,
                description:error.originalError.info.message,
                data:[]})
            }
        })
    },

    update: (req, res) => {

        let object = {
            update_programs: JSON.parse(req.body.inputJSON)
        }

        Programs.update(object, res.locals.slug, res.locals.userId).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            if(isJsonString.isJsonString(error.originalError.info.message)){
                res.status(500).json(JSON.parse(error.originalError.info.message))
            }
            else{
                res.status(500).json({status:500,
                description:error.originalError.info.message,
                data:[]})
            }
        })
    },

    create: (req, res) => {

        let object = {
            import_programs: JSON.parse(req.body.inputJSON)
        }

        console.log("object:::::::::::>>",object)

        Programs.save(object, res.locals.slug, res.locals.userId).then(result => {

            //IF ROOM APPLILICED ACCESSFULLY THEN NEED TO UPDATE SETTING TABLE DATA
            if (req.body.settingName) {
                Settings.updateByName(res.locals.slug, req.body.settingName)
            }

            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            if(isJsonString.isJsonString(error.originalError.info.message)){
                res.status(500).json(JSON.parse(error.originalError.info.message))
            }
            else{
                res.status(500).json({status:500,
                description:error.originalError.info.message,
                data:[]})
            }
        })
    },

    delete: (req, res) => {

        console.log('BODY DATA::::::::::::>>>>>>',req.body)

        Programs.delete(req.body.id, res.locals.slug, res.locals.userId).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            console.log('error::::::::::::>>>>>>',error)
            if(isJsonString.isJsonString(error.originalError.info.message)){
                res.status(500).json(JSON.parse(error.originalError.info.message))
            }
            else{
                res.status(500).json({status:500,
                description:error.originalError.info.message,
                data:[]})
            }
        })

    },

    downloadMaster: async(req, res, next) => {
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet('Programs Master');
        worksheet.columns = [
          { header: "Program Id", key: "program_id", width: 10 },
          { header: "Program Name", key: "program_name", width: 30 },
          { header: "Abbr", key: "abbr", width: 25 },
          { header: "Program Code", key: "program_code", width: 25 },
          { header: "Program Type", key: "program_type", width: 25 }
        ];

        Programs.downloadExcel(res.locals.slug).then(result => {
            console.log('result::>>', result.recordset)
            // Add Array Rows
            worksheet.addRows(result.recordset);
            // res is a Stream object
            res.setHeader(
              "Content-Type",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
              "Content-Disposition",
              "attachment; filename=" + "ProgramsMaster.xlsx"
            );
            return workbook.xlsx.write(res).then(function () {
              res.status(200).end();
            });
        })
    },

    showEntries:(req, res, next)=>{
        Programs.fetchAll(req.body.rowcount, res.locals.slug).then(result => {
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

