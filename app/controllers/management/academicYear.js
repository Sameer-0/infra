const {
    check,
    oneOf,
    validationResult
} = require('express-validator');
const AcademicYear = require('../../models/AcademicYear')
const Buildings = require('../../models/Buildings')
const Organizations = require("../../models/Organizations")
const Campuses = require("../../models/Campuses")
const SlotIntervalTimings = require("../../models/SlotIntervalTimings")

module.exports = {
    getAcadYearPage: (req, res, next) => {
        AcademicYear.fetchAll().then(result => {
            res.render('management/academicYear/academicYear', {
                academicDetails: result.recordset[0],
                status: 200,
                message: "Sucess",
                title: "Academic Year",
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        }).catch(err => {
            res.status(500).send({
                status: 500,
                message: "Something Went Wrong" + err
            })
        })
    },

    updateAcadYear: (req, res) => {
        AcademicYear.update(req.body).then(result => {
            res.redirect('/management/academic/academic-year')
        }).catch(err => {
            res.status(500).send({
                status: 500,
                message: "Something Went Wrong" + err
            })
        })
    }
}