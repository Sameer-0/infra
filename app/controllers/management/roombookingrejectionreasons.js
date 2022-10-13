const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const RoomBookingRejectionReasons = require("../../models/RoomBookingRejectionReasons")

module.exports = {
    getPage: (req, res) => {
        RoomBookingRejectionReasons.fetchAll(10).then(result => {

            res.render('management/cancellation/bookingrejectionreasons', {
                RoomCancellationReasonsList: result.recordset,
                breadcrumbs: req.breadcrumbs,
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

        RoomBookingRejectionReasons.save(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })

    },

    getById: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        RoomBookingRejectionReasons.getById(req.body.id).then(result => {
            res.json({
                status: 200,
                message: "Success",
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

        RoomBookingRejectionReasons.update(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    delete: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        RoomBookingRejectionReasons.delete(req.body.id).then(result => {
            res.json({
                status: 200,
                message: "Success"
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

        //here 10is rowcount
        let rowcont = 10;

        RoomBookingRejectionReasons.search(rowcont, req.body.keyword).then(result => {
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
    }



}