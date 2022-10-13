const Days = require('../../models/Days')
const {
    validationResult
} = require('express-validator');
const isJsonString = require('../../utils/util')


module.exports = {

    getPage: (req, res) => {
        Days.fetchAll(10, res.locals.slug).then(result => {
            console.log(result)
            res.render('admin/days/index', {
                dayList: result.recordset,
                breadcrumbs: req.breadcrumbs,
            })
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

        Days.update(req.body, res.locals.slug).then(result => {
            res.status(200).json({
                status: 200,
                message: "Success"
            })
        }).catch(error => {
            console.log(error)
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

    GetAll: (req, res) => {
        Days.fetchAll(10, res.locals.slug).then(result => {
            res.status(200).json({
                result: result.recordset
            })
        }).catch(error=>{
            if(isJsonString.isJsonString(error.originalError.info.message)){
                res.status(500).json(JSON.parse(error.originalError.info.message))
            }
            else{
                res.status(500).json({status:500,
                description:error.originalError.info.message,
                data:[]})
            }
        })
    }

}