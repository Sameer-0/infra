const {
    check,
    oneOf,
    validationResult
} = require('express-validator');
const divisionModel = require('../../models/Divisions')
const CourseWorkload = require('../../models/CourseWorkload')



module.exports = {
    getPage: (req, res) => {
        let rowcount = 50;

        Promise.all([divisionModel.fetchAll(rowcount), CourseWorkload.fetchAll()]).then(result => {
            res.render('management/division/index', {
                divisionList: result[0].recordset,
                courseList: result[1].recordset
            })
        })

    },

    addDivision: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }


        divisionModel.addDivision(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success",
                body: req.body

            })
        })
    },

    getDivisionById: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }


        divisionModel.getDivision(req.query.id).then(result => {
            res.json({
                status: 200,
                divisionData: result.recordset[0]
            })
        })
    },

    updateDivisionById: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        divisionModel.updateDivision(req.body).then(result => {
            res.json({
                status: 200,

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
        divisionModel.search(rowcount, req.query.keyword).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: 200,
                    message: "DivisionData Fetched",
                    data: result.recordset,
                    length: result.recordset.length
                })
            } else {
                res.json({
                    status: 400,
                    message: 'No Data Found',
                    data: result.recordset,
                    length: result.recordset.length
                })
            }
        }).catch(error => {
            console.log('Error::', error)
            res.json({
                status: 500,
                message: 'Something Went Wrong'
            })
        })
    },

    deleteDivisionById: (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }


        divisionModel.deleteDivision(req.body.id).then(result => {
            res.json({
                status: 200
            })

        })
    }
}