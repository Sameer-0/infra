const {
    check,
    oneOf,
    validationResult
} = require('express-validator');


const AcadSession = require("../../models/AcadSession")
const isJsonString = require('../../utils/util')


module.exports = {

    getPage: (req, res) => {
        Promise.all([AcadSession.fetchAll(10), AcadSession.getCount()]).then(result => {
            res.render('management/academic/acadSession', {
                acadSession: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
           
            })
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

        AcadSession.search(req.body).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Academic Session fetched",
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

    create: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }


        AcadSession.save(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success",
            })
        }).catch(error => {
            res.json({
                status: 500,
                message: "Fail",
            })
        })
    },

    single: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }


        AcadSession.getById(req.body.Id).then(result => {
            res.json({
                status: 200,
                data: result.recordset[0]
            })
        })
    },

    update: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }


        AcadSession.update(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success",
            })
        })
    },

    delele: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }


        AcadSession.softDeleteById(req.body.Id).then(result => {
            res.json({
                status: 200,
                message: "Success",
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

        AcadSession.fetchChunkRows(req.body.pageNo).then(result => {
            res.json({
                status: "200",
                message: "Quotes fetched",
                data: result.recordset,
                length: result.recordset.length
            })
        }).catch(error => {
            throw error
        })
    }
}