const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const RoomTransactionRequest = require('../../models/RoomTransactionRequest')
const RoomTransactions = require('../../models/RoomTransactions')
const Tenants = require('../../models/Tenants')
const RoomTransactionDetails = require('../../models/RoomTransactionDetails')
const isJsonString = require('../../utils/util')


module.exports = {
    getPage: (req, res) => {
        Promise.all([RoomTransactionRequest.fetchAll(10, res.locals.slug), RoomTransactionRequest.getCount(res.locals.slug)]).then(result => {
            console.log('svkm room transaction details::>>', result[0].recordset)
            res.render('management/room/requests', {
                requestedList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                breadcrumbs: req.breadcrumbs,
            })
        })
    },


    search: (req, res) => {
        RoomTransactionRequest.search(req.body, res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
                res.status(200).json({
                    status: "200",
                    message: "Room Type fetched",
                    data: result.recordset,
                    length: result.recordset.length
                })
            } else {
                res.status(200).json({
                    status: "200",
                    message: "No data found",
                    data: result.recordset,
                    length: result.recordset.length
                })
            }
        }).catch(error => {
            res.status(500).json(error.originalError.info.message)
        })
    },

    pagination: (req, res, ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        RoomTransactionRequest.pagination(req.body.pageNo, res.locals.slug).then(result => {
            res.json({
                status: "200",
                message: "Quotes fetched",
                data: result.recordset,
                length: result.recordset.length
            })
        }).catch(error => {
            console.log(error)
        })
    },

    roomInfo: (req, res) => {
        RoomTransactionRequest.findOne(res.locals.slug, req.body.id).then(_tresult => {
            console.log('Room Transaction:::::::::::::', _tresult.recordset[0])
            Tenants.findOne(_tresult.recordset[0].tenant_id).then(_tenant => {
                RoomTransactionDetails.roomInfo(_tenant.recordset[0].slug_name, _tresult.recordset[0].tenant_room_transaction_id).then(_rinfo => {
                    console.log('_rinfo::::::::::::',_rinfo)
                    res.status(200).json({
                        data: _rinfo.recordset,
                        transactionid: _tresult.recordset[0].id
                    })
                })
            })
        })
    },


    requestApproval: (req, res) => {

        console.log('Body::::::::::::::>>>', req.body)

        RoomTransactionRequest.RequestApproval(res.locals.slug, req.body).then(result => {
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