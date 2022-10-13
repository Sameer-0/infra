const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const RoomTransactionDetails = require('../../../models/RoomTransactionDetails')

module.exports = {

    findByLid: (req, res) => {
        console.log('req::::::::::::::::::::', req.query.id)
        RoomTransactionDetails.findByRoomTransactionId(req.body.id, res.locals.slug).then(result => {
            res.status(200).json({
                status: 200,
                data: result.recordset,
                message:'success',
                breadcrumbs: req.breadcrumbs,
            })
            console.log(result.recordset)
        })
    },


    delete: (req, res) => {
        RoomTransactionDetails.delete(req.body.id, res.locals.slug, res.locals.userId).then(result => {
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

}