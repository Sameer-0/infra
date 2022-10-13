const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const ProgramDays = require('../../../models/ProgramDays')
const isJsonString = require('../../../utils/util')
const excel = require("exceljs");


module.exports = {

    getPage: (req, res) => {
        Promise.all([ProgramDays.fetchAll(10, res.locals.slug), ProgramDays.getCount(res.locals.slug)]).then(result => {
            console.log('programdayList::::::::',result[0].recordset)
            res.render('admin/programs/days', {
                programdayList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })
    },

    search: (req, res) => {
        let rowcount = 10;
        ProgramDays.search(req.body, res.locals.slug).then(result => {
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

        ProgramDays.pagination(req.body.pageNo, res.locals.slug).then(result => {
            res.json({
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

    changeStatus: (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }


        ProgramDays.update(req.body, res.locals.slug, res.locals.userId).then(result => {
            res.status(200).json({
                status: 200,
                message: "Success"
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

    getAll: (req, res) => {
        ProgramDays.fetchAll(10, res.locals.slug).then(result => {
            res.status(200).json({
                result: result.recordset
            })
        }).catch(error=>{
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

    refresh: (req, res) => {
        console.log('Refresh Program Days::::::::>>')
        ProgramDays.refresh(res.locals.slug, res.locals.userId).then(result => {
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

    downloadMaster: async(req, res, next) => {
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet('ProgramDays Master');
        worksheet.columns = [
          { header: "Program Name", key: "program_name", width: 30 },
          { header: "Program Id", key: "program_id", width: 25 },
          { header: "Day", key: "day_name", width: 25 },
          { header: "IsLecture", key: "is_lecture", width: 10 },
          { header: "Program Type", key: "program_type", width: 20 }
        ];

        ProgramDays.downloadExcel(res.locals.slug).then(result => {
            // Add Array Rows
            worksheet.addRows(result.recordset);
            // res is a Stream object
            res.setHeader(
              "Content-Type",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
              "Content-Disposition",
              "attachment; filename=" + "ProgramDaysMaster.xlsx"
            );
            return workbook.xlsx.write(res).then(function () {
              res.status(200).end();
            });
        })
    },

    showEntries:(req, res, next)=>{
        ProgramDays.fetchAll(req.body.rowcount, res.locals.slug).then(result => {
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