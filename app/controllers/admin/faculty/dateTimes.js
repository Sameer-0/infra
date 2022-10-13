const Faculties = require('../../../models/Faculties');
const FacultyDateTimes = require('../../../models/FacultyDateTimes');
const AcademicCalender = require('../../../models/AcademicCalender');
const SlotIntervalTimings = require('../../../models/SlotIntervalTimings');
const {
    check,
    oneOf,
    validationResult
} = require('express-validator');
const isJsonString = require('../../../utils/util')
const excel = require("exceljs");


module.exports = {
    getPage: (req, res) => {

        Promise.all([FacultyDateTimes.fetchAll(10, res.locals.slug), FacultyDateTimes.getCount(res.locals.slug), Faculties.fetchAll(1000, res.locals.slug), AcademicCalender.fetchAll(1000), SlotIntervalTimings.fetchAll(1000)]).then(result => {
            res.render('admin/faculty/facultydatetime', {
                FacultyDateTimeList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                facultyList: result[2].recordset,
                AcademicCalenderList: result[3].recordset,
                SlotIntervalTimingsList: result[4].recordset,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })

    },

    create: (req, res) => {

        let object = {
            add_faculty_date_times: JSON.parse(req.body.inputJSON)
        }

        FacultyDateTimes.save(object, res.locals.slug, res.locals.userId).then(result => {
            if (req.body.settingName) {
                Settings.updateByName(res.locals.slug, req.body.settingName)
            }
            res.status(200).json(JSON.parse(result.output.output_json))
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

    search: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        FacultyDateTimes.search(req.body, res.locals.slug).then(result => {
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
        FacultyDateTimes.pagination(req.body.pageNo, res.locals.slug).then(result => {
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


    delete: (req, res) => {
        FacultyDateTimes.delete(req.body.id, res.locals.slug, res.locals.userId).then(result => {
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

    getSlotsById: (req, res, next) => {
        SlotIntervalTimings.getFacultySlotsById(req.body.facultyid, res.locals.slug).then(result => {
            res.json({
                status: 200,
                message: "Success",
                result: result.recordset
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
        FacultyDateTimes.findOne(req.body.id, res.locals.slug).then(result => {
            res.json({
                status: 200,
                data: result.recordset[0]
            })
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },

    update: (req, res) => {

        let object = {
            update_faculty_date_times: JSON.parse(req.body.inputJSON)
        }
           
        FacultyDateTimes.update(object, res.locals.slug, res.locals.userId).then(result => {
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
        let worksheet = workbook.addWorksheet('Faculty Date Time Master');
        worksheet.columns = [
          { header: "Faculty ID", key: "faculty_id", width: 10 },
          { header: "Faculty Name", key: "faculty_name", width: 25 },
          { header: "Faculty Type", key: "faculty_type", width: 25 },
          { header: "Start Date", key: "start_date", width: 25 },
          { header: "End Date", key: "end_date", width: 25 },
          { header: "Start Time", key: "start_time", width: 25 },
          { header: "End Time", key: "end_time", width: 25 }
        ];

        FacultyDateTimes.downloadExcel(res.locals.slug).then(result => {
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
        FacultyDateTimes.fetchAll(req.body.rowcount, res.locals.slug).then(result => {
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