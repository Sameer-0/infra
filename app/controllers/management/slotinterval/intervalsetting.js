const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const SlotIntervalSetting = require("../../../models/SlotIntervalSetting")
module.exports = {
    getMainPage: (req, res) => {
        res.render('management/slotintervals/index')
    },

    getPage: (req, res) => {
        SlotIntervalSetting.fetchAll(10).then(result => {
            res.render('management/slotintervals/setting', {
                slotSetting: result.recordset
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

        let rowcount = 10;
        SlotIntervalSetting.search(rowcount, req.body.keyword).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Slot Setting fetched",
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

        SlotIntervalSetting.create(req.body).then(result => {
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

        SlotIntervalSetting.single(req.body.Id).then(result => {
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

        SlotIntervalSetting.update(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success",
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

        SlotIntervalSetting.delete(req.body.id).then(result => {
            res.json({
                status: 200,
                message: "Success",
            })
        })
    }
}