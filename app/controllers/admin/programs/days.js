const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const ProgramDays = require('../../../models/ProgramDays')

module.exports = {

    getPage: (req, res) => {
        Promise.all([ProgramDays.fetchAll(10, res.locals.slug), ProgramDays.getCount(res.locals.slug)]).then(result => {
            console.log('recordset::::::::',result[0].recordset)
            res.render('admin/programs/days', {
                programdayList: result[0].recordset,
                pageCount: result[1].recordset[0].count
            })
        })
    },

    search: (req, res) => {
        let rowcount = 10;
        ProgramDays.search(rowcount, req.query.keyword, res.locals.slug).then(result => {
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
            res.status(500).json(error.originalError.info.message)
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

        ProgramDays.pagination(req.body.pageNo, res.locals.slug).then(result => {
            res.json({
                status: "200",
                message: "Quotes fetched",
                data: result.recordset,
                length: result.recordset.length
            })
        }).catch(error => {
            throw error
        })
    },

    changeStatus: (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        console.log('REQL:L:L:L:L:L:L:L:L:L:L:', req.body)

        ProgramDays.update(req.body, res.locals.slug, res.locals.userId).then(result => {
            res.status(200).json({
                status: 200,
                message: "Success"
            })
        }).catch(error => {
            console.log(error)
            res.status(500).json(error.originalError.info.message)
        })
    },

    getAll: (req, res) => {
        ProgramDays.fetchAll(10, res.locals.slug).then(result => {
            res.status(200).json({
                result: result.recordset
            })
        }).catch(error=>{
            res.status(500).json({status:500, message:"Error occured"})
        })
    },

    refresh: (req, res) => {
        console.log('Refresh Program Days::::::::>>')
        ProgramDays.refresh(res.locals.slug, res.locals.userId).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    }
}