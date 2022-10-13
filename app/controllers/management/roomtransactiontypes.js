const {
    check,
    oneOf,
    validationResult,
    Result
} = require('express-validator');

const RoomTransactionTypes = require('../../models/RoomTransactionTypes')

module.exports = {
    getPage: (req, res) => {

        Promise.all([RoomTransactionTypes.fetchAll(10), RoomTransactionTypes.getCount()]).then(result => {
            res.render('management/booking/room_transaction_types', {
                roomTransactionTypeList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })

    },

    create: (req, res) => {

        let object = {
            add_room_transaction_types: JSON.parse(req.body.inputJSON)
        }

        RoomTransactionTypes.save(object, res.locals.userId).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },

    findOne: (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        console.log('IDIDID',req.body.Id)

        RoomTransactionTypes.getRTSId(req.body.Id).then(result => {
            res.json({
                status: 200,
                message: "Success",
                data: result.recordset[0]
            })
        })
    },

    update: (req, res) => {

        let object = {
            update_room_transaction_types: JSON.parse(req.body.inputJSON)
        }

        RoomTransactionTypes.update(object,  res.locals.userId).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            console.log('error', error)
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },

    delete: (req, res) => {

        let object = {
            delete_room_transaction_types: JSON.parse(req.body.inputJSON)
        }

        RoomTransactionTypes.delete(object).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
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
        RoomTransactionTypes.search(rowcont, req.body.keyword).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Room Transaction Type fetched",
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

        RoomTransactionTypes.fetchChunkRows(rowcount, req.body.pageNo).then(result => {
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