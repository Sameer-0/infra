const {
    validationResult
} = require('express-validator');
const AcademicYear = require('../../models/AcademicYear')
const Buildings = require('../../models/Buildings')
const Organizations = require("../../models/Organizations")
const Campuses = require("../../models/Campuses")
const SlotIntervalTimings = require("../../models/SlotIntervalTimings")
const Settings = require('../../models/Settings')
const isJsonString = require('../../utils/util')

module.exports = {
    getCampusPage: (req, res) => {
        if (req.method == "GET") {
            Promise.all([Campuses.fetchAll(10), Campuses.getCount()]).then(result => {
                res.render('management/campus/index', {
                    status: 200,
                    campusList: result[0].recordset,
                    pageCount: result[1].recordset[0].count,
                    breadcrumbs: req.breadcrumbs,
                })
            })
        } else if (req.method == "POST") {
            Campuses.pagination(req.body.pageNo).then(result => {
                res.json({
                    status: "200",
                    message: "fetched",
                    data: result.recordset,
                    length: result.recordset.length
                })
            })
        }
    },

    create: (req, res) => {

        if (req.body.settingName) {
            Settings.updateByName(res.locals.slug, req.body.settingName)
        }
        let object = {
            add_new_campus: JSON.parse(req.body.inputJSON)
        }

        Campuses.saveWithProc(object, res.locals.userId).then(result => {
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

    findOne: (req, res) => {
        Campuses.findOne(req.body.Id).then(result => {
            res.json({
                status: 200,
                result: result.recordset[0]
            })
        })
    },

    update: (req, res) => {
        let object = {
            update_campuses: JSON.parse(req.body.inputJSON)
        }
        Campuses.update(object, res.locals.userId).then(result => {
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


    delete: (req, res) => {
        console.log('BODY::::::::::::>>>>>>',req.body.id)
        Campuses.delete(req.body.id, res.locals.userId).then(result => {
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


    search: (req, res) => {
        Campuses.searchCampus(req.body).then(result => {
            console.log('campyus searchh', result.recordset)
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Campus fetched",
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
    }


}