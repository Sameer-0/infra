const {
    check,
    oneOf,
    validationResult
} = require('express-validator');


const divisionModel = require('../../models/Divisions')
const divBatchModel = require('../../models/DivisionBatches')

module.exports = {
    getPage: (req, res) => {
        Promise.all([divBatchModel.fetchAll(10), divisionModel.fetchAll(50)]).then(result => {
            res.render('management/division/divisionBatches', {
                batchList: result[0].recordset,
                divisionList: result[1].recordset
            })
        })
    },

    createBatch: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        divBatchModel.addBatch(req.body).then(result => {
            res.json({
                status:200,
                message: 'success',
                body: req.body
            })
        })
    },

    getBatchById: (req, res) => {
        divBatchModel.getBatch(req.query.id).then(result => {
            res.json({
                status: 200,
                batchData: result.recordset[0]
            })
        })
    },

    updateBatchById: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }
        divBatchModel.updateBatch(req.body).then(result => {
            res.json({
                status:200
            })
        })
    }
}