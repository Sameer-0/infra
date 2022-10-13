const programTypeModel = require('../../../models/programType')
const {
    check,
    oneOf,
    validationResult
} = require('express-validator');
const isJsonString = require('../../../utils/util')


module.exports = {
    
    getProgramTypePage: (req, res) => {

        Promise.all([programTypeModel.fetchAll(), programTypeModel.getCount()]).then(result => {
            console.log('breadddd', req.originalUrl )
            res.render('admin/programs/programType', {
                programList: result[0].recordset,
                pageCount:result[1].recordset[0].count,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
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
        programTypeModel.save(req.body).then(result => {
            res.status(200).json({
                status: 200,
                message: "Success"
            })
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


    findOne: (req, res) => {
        programTypeModel.getProgramTypeById(req.body.id).then(result => {

            res.json({
                status: 200,
                message: "Success",
                programData: result.recordset[0]
            })
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

    update: (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        programTypeModel.update(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success",

            })
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



    delete: (req, res) => {
        programTypeModel.delete(req.body.Ids).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
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



    search: (req, res) => {
        let rowcount = 10;
        programTypeModel.searchProgramType(rowcount, req.body.keyword).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Room Type fetched",
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

    pagination: (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        programTypeModel.fetchChunkRows(rowcount, req.body.pageNo).then(result => {
            res.json({
                status: "200",
                message: "Quotes fetched",
                data: result.recordset,
                length: result.recordset.length
            })
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