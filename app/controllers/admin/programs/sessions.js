const {
    check,
    oneOf,
    validationResult
} = require('express-validator');


const ProgramSessions = require('../../../models/ProgramSessions')
const isJsonString = require('../../../utils/util')
const excel = require("exceljs");



module.exports = {
    getPage: (req, res) => {
        Promise.all([ProgramSessions.fetchAll(10, res.locals.slug), ProgramSessions.getCount(res.locals.slug)]).then(result => {
           // console.log(result.recordset)
            res.render('admin/programs/sessions', {
                programSessions: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })
    },

    search: (req, res) => {
        ProgramSessions.search(req.body, res.locals.slug).then(result => {
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

        ProgramSessions.pagination(req.body.pageNo, res.locals.slug).then(result => {
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

    refresh: (req, res) => {
        //console.log('Refresh Program Session::::::::>>')
        ProgramSessions.refresh(res.locals.slug, res.locals.userId).then(result => {
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

    getSessions: (req, res, next) => {
        ProgramSessions.getSessionForProgram(res.locals.slug, req.body.programLid)
        .then( result => {
            //console.log('result', result)
            res.status(200).json(result.recordset)
      
        })
        .catch( error => {
            console.log('error', error);
        })
    },

    getSessionsByProgram: (req, res) => {
       // console.log('getSessionsByProgram::::::::>>', req.body)

        ProgramSessions.getLockedSessionByProgram(res.locals.slug, req.body.programLid)
        .then(result => {
           // console.log(result)
            res.status(200).json(result.recordset)
        })
        .catch(error => {

            console.log(error)

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

    getUnlockedSessionsByProgram: (req, res) => {
        //console.log('getSessionsByProgram::::::::>>', req.body)

        ProgramSessions.getUnlockedSessionByProgram(res.locals.slug, req.body.programLid)
        .then(result => {
            console.log(result)
            res.status(200).json(result.recordset)
        })
        .catch(error => {

            console.log(error)

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
        let worksheet = workbook.addWorksheet('ProgramSessions Master');
        worksheet.columns = [
          { header: "Program Name", key: "program_name", width: 30 },
          { header: "Program Code", key: "program_code", width: 25 },
          { header: "Program Id", key: "program_id", width: 25 },
          { header: "Acad Session", key: "acad_session", width: 25 },
          { header: "Acad Year", key: "acad_year", width: 10 },
          { header: "Program Type", key: "program_type", width: 20 }
        ];

        ProgramSessions.downloadExcel(res.locals.slug).then(result => {
            //console.log('result', result.recordset)
            // Add Array Rows
            worksheet.addRows(result.recordset);
            // res is a Stream object
            res.setHeader(
              "Content-Type",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
              "Content-Disposition",
              "attachment; filename=" + "ProgramSessionsMaster.xlsx"
            );
            return workbook.xlsx.write(res).then(function () {
              res.status(200).end();
            });
        })
    },


    showEntries:(req, res, next)=>{
        ProgramSessions.fetchAll(req.body.rowcount, res.locals.slug).then(result => {
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