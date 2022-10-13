const {
    validationResult
} = require('express-validator');
const CancellationReasons = require("../../models/CancellationReasons")
module.exports = {
    getPage: (req, res) => {
        CancellationReasons.fetchAll(10).then(result => {
            res.render('management/cancellation/index', {
                CancellationReasonsList: result.recordset
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

        CancellationReasons.save(req.body).then(result => {
            res.json({
                status: 200,
                messsage: "Success"
            })
        }).catch(error => {
            res.json({
                status: 500,
                messsage: "Error"
            })
        })
    },

    single: (req, res) => {
        CancellationReasons.getById(req.body.id).then(result => {
            res.json({
                status: 500,
                messsage: "Success",
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

        CancellationReasons.update(req.body).then(result => {
            res.json({
                status: 200,
                messsage: "Success"
            })
        }).catch(error => {
            res.json({
                status: 500,
                messsage: "Error"
            })
        })
    },

    delete: (req, res) => {
        CancellationReasons.delete(req.body.id).then(result => {
            res.json({
                status: 200,
                messsage: "Success"
            })
        }).catch(error => {
            res.json({
                status: 500,
                messsage: "Error"
            })
        })
    },

    search: (req, res) => {
        //here 10is rowcount
        let rowcont = 10;
        CancellationReasons.search(rowcont, req.body.keyword).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Room Cancellation fetched",
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
    }
}