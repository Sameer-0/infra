const {
    check,
    oneOf,
    validationResult,
    Result
} = require('express-validator');

const HolidayTypes = require('../../models/HolidayTypes')

module.exports = {

    getPage: (req, res) => {

        Promise.all([HolidayTypes.fetchAll(10), HolidayTypes.getCount()]).then(result => {
            res.render('management/holiday/types', {
                holidayTypeList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                breadcrumbs: req.breadcrumbs
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

        HolidayTypes.insert(req.body).then(result => {
            res.status(200).json({
                status: 200,
                message: "Success"
            })
        }).catch(error => {
            console.log(error)
            res.status(500).json(error.originalError.info.message)
        })
    },

    findOne: (req, res) => {
        HolidayTypes.findOne(req.body.Id).then(result => {
            res.json({
                status: 200,
                result: result.recordset[0]
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
        HolidayTypes.update(req.body).then(result => {
            res.status(200).json({
                status: 200,
                message: "Success"
            })
        }).catch(error => {
            res.status(500).json(error.originalError.info.message)
        })
    },

    delete: (req, res) => {
        HolidayTypes.delete(req.body.Ids).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        }).catch(error => {
            res.status(500).json(error.originalError.info.message)
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

        //here 10is rowcount
        let rowcont = 10;
        HolidayTypes.search(rowcont, req.body.keyword).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Holiday Fetch",
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

        HolidayTypes.fetchChunkRows(rowcount, req.body.pageNo).then(result => {
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