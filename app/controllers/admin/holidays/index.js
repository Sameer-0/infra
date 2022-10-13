const {
    check,
    validationResult,
    body
} = require('express-validator');

const Holidays = require('../../../models/Holidays')
const HolidayType = require('../../../models/HolidayTypes')
const AcadYear = require('../../../models/AcademicYear')
const AcademicCalender = require('../../../models/AcademicCalender')
const Settings = require('../../../models/Settings');

const path = require("path");
var soap = require("soap");
const isJsonString = require('../../../utils/util');
const excel = require("exceljs");


module.exports = {


    getPage: (req, res) => {
        Promise.all([Holidays.fetchAll(10, res.locals.slug), HolidayType.fetchAll(100), Holidays.getCount(res.locals.slug), AcadYear.fetchAll(), AcademicCalender.fetchAll(10000)]).then(result => {
            res.render('admin/holidays/index', {
                holidayList: result[0].recordset,
                holidayType: result[1].recordset,
                pageCount: result[2].recordset[0].count,
                acadYear: result[3].recordset[0].input_acad_year,
                academicCalender: result[4].recordset,
                breadcrumbs: req.breadcrumbs,
            })
        })
    },

    create: (req, res) => {
        console.log('holidays controller', req.body)
        if (req.body.settingName) {
            Settings.updateByName(res.locals.slug, req.body.settingName)
        }

        let object = {
            insert_new_holidays: JSON.parse(req.body.inputJSON)
        }


        Holidays.save(object, res.locals.slug, res.locals.userId).then(result => {
            console.log('result:::<><', result)
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

    findOne: (req, res) => {
        Holidays.findOne(req.body.Id, res.locals.slug).then(result => {
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
            update_holidays: JSON.parse(req.body.inputJSON)
        }
        Holidays.update(object, res.locals.slug, res.locals.userId).then(result => {
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

        console.log('Delete Call', req.body)
        let object = {
            delete_holidays: JSON.parse(req.body.id)
        }

        Holidays.delete(object, res.locals.slug, res.locals.userId).then(result => {
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


        Holidays.search(req.body, res.locals.slug).then(result => {
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
        Holidays.pagination(req.body.pageNo, res.locals.slug).then(result => {
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

    fetchFromSAP: async (req, res, next) => {
        let {
            acadYear
        } = req.body;
        var wsdlUrl = path.join(
            process.env.WSDL_PATH,
            "zhr_holiday_date_jp_bin_sqh_20220808.wsdl"
        );
           let soapClient = await new Promise(resolve => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) {
                    console.log('error holiday wsdl:>>', err)
                    next(err);
                }
                resolve(soapClient);
            })
        })

        console.log('soap client holiday wsdl::>>', soapClient)
        console.log('Acadyear, Campusid, Schoolobjectid::>>', res.locals.acadmicYear, res.locals.campusIdSap, res.locals.organizationIdSap)

        let holidayList = await new Promise(async resolve => {
            await soapClient.ZhrHolidayDateJp({
                    Acadyear: res.locals.acadmicYear,
                    Campusid: res.locals.campusIdSap == 1 ? "" :  res.locals.campusIdSap,
                    Schoolobjectid: res.locals.organizationIdSap,
                },
                async function (err, result) {
                    let output = await result;
                    resolve(output.Output.item);
                });
        })
      

        let object = {
            add_holidays: holidayList
          }

        Holidays.fetchHolidaySap(object, res.locals.slug).then(result => {
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

    downloadMaster: async(req, res, next) => {
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet('Holiday Master');
        worksheet.columns = [
          { header: "Calendar Year", key: "calendar_year", width: 10 },
          { header: "Day", key: "dayname", width: 25 },
          { header: "Holiday Date", key: "h_date", width: 25 },
          { header: "Holiday Type", key: "holiday_type", width: 25 },
          { header: "Reason", key: "reason", width: 25 }
         
        ];

        Holidays.downloadExcel(res.locals.slug).then(result => {
            // Add Array Rows
            worksheet.addRows(result.recordset);
            // res is a Stream object
            res.setHeader(
              "Content-Type",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
              "Content-Disposition",
              "attachment; filename=" + "HolidayMaster.xlsx"
            );
            return workbook.xlsx.write(res).then(function () {
              res.status(200).end();
            });
        })
    },

    showEntries:(req, res, next)=>{
        Holidays.fetchAll(req.body.rowcount, res.locals.slug).then(result => {
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