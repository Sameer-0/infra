const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const WeeklyConstraint = require('../../../models/WeeklyConstraint')
const isJsonString = require('../../../utils/util')


module.exports = {
    getPage: (req, res) => {
        Promise.all([WeeklyConstraint.fetchAll(10, res.locals.slug), WeeklyConstraint.getCount(res.locals.slug)]).then(result => {

            res.render('admin/weekly-constraint/index.ejs', {
                weeklyConstraintList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
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
        
        WeeklyConstraint.save(req.body, res.locals.slug).then(result => {
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

        WeeklyConstraint.findById(req.body.id, res.locals.slug).then(result => {
            res.json({
                status: 200,
                message: "Success",
                data: result.recordset[0]
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

        console.log('uPDATE DATA req.body::::', req.body)
        WeeklyConstraint.update(req.body, res.locals.slug).then(result => {
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

        console.log('req.body.Ids::::::::::', req.body.Ids)
        WeeklyConstraint.delete(req.body.Ids, res.locals.slug).then(result => {
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

    deleteAll: (req, res) => {
        console.log('all delete!!!!!!!')
        WeeklyConstraint.deleteAll(res.locals.slug).then(result => {
            res.status(200).json({
                status: 200
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

        console.log(req.query.keyword)

        // res.json({
        //     status: "200",
        //     message: "Room Type fetched",
        //     data: [1,2,3,4,5,6]
        // })

        WeeklyConstraint.search(rowcount, req.body.keyword, res.locals.slug).then(result => {
            console.log('Search result.recordset', result.recordset)
            if (result.recordset.length > 0) {

                res.json({
                    status: "200",
                    message: "Room Type fetched",
                    data: result.recordset,
                    length: result.recordset.length
                })


            } else {
                console.log(result.recordset+result.recordset.length)
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

        WeeklyConstraint.pagination(req.body.pageNo, res.locals.slug).then(result => {
            res.json({
                status: "200",
                message: "Quotes fetched",
                data: result.recordset,
                length: result.recordset.length
            })
        }).catch(error => {
            console.log(error)
            throw error
        })
    }
}