const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const AcademicCalender = require("../../models/AcademicCalender")
const AcademicYear = require("../../models/AcademicYear")
const isJsonString = require("../../utils/util")


module.exports = {

    getPage: (req, res) => {
        Promise.all([AcademicCalender.fetchAll(10), AcademicCalender.getCount()]).then(result => {
            res.render('management/academic/acadCalender', {
                acadCalender: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl

            })
        })
    },


    search: (req, res) => {
        AcademicCalender.search(req.body).then(result => {
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

        AcademicCalender.fetchChunkRows(req.body.pageNo).then(result => {
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

    //GENERATE ACADEMIC CALENDER
    refresh: (req, res) => {
        console.log('Res::::', res.locals)
        AcademicCalender.refresh(res.locals.slug, res.locals.userId).then(result => {
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

}