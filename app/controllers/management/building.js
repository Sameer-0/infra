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
const Settings = require('../../models/Settings');
const isJsonString = require('../../utils/util')
module.exports = {

    getPage: (req, res) => {

        if (req.method == "GET") {
            Promise.all([Buildings.fetchAll(10), Organizations.fetchAll(50), Campuses.fetchAll(50), SlotIntervalTimings.fetchAll(1000), Buildings.getCount()]).then(result => {
               console.log(result[3].recordset)
                res.render('management/buildings/index', {
                    buildingList: result[0].recordset,
                    orgList: result[1].recordset,
                    campusList: result[2].recordset,
                    timeList: result[3].recordset,
                    pageCount: result[4].recordset[0].count,
                    breadcrumbs: req.breadcrumbs,
                })
            }).catch(error => {
                throw error
            })
        } else if (req.method == "POST") {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(422).json({
                    statuscode: 422,
                    errors: errors.array()
                });
                return;
            }

            Buildings.fetchChunkRows(rowcount, req.body.pageNo).then(result => {

                res.json({
                    status: "200",
                    message: "Quotes fetched",
                    data: result.recordset,
                    length: result.recordset.length
                })
            }).catch(error => {
                throw error
            })
        }

    },

    create: (req, res) => {

        if (req.body.settingName) {
            Settings.updateByName(res.locals.slug, req.body.settingName)
        }

        let object = {
            add_new_buildings: JSON.parse(req.body.inputJSON)
        }

        Buildings.save(object, res.locals.userId).then(result => {
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

    findOne: (req, res) => {

        Buildings.findOne(req.body.Id).then(result => {
            res.json({
                status: 200,
                buildingData: result.recordset[0]
            })
        })
    },

    update: (req, res) => {
        let object = {
            update_buildings: JSON.parse(req.body.inputJSON)
        }
        Buildings.update(object, res.locals.userId).then(result => {
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


    delete: (req, res) => {
        console.log('BODY::::::::::::>>>>>>', req.body.id)
        Buildings.delete(req.body.id, res.locals.userId).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            console.log(error)
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


    search: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        //here 10is rowcount
        let rowcount = 10;

        Buildings.search(rowcount, req.body.keyword).then(result => {
            console.log('building search list', result.recordset)
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Building fetched",
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
            console.log(error)
            res.json({
                status: "500",
                message: "Something went wrong",
            })
        })
    },

    getBuildingByCampusId: (req, res, next) => {
        Buildings.buildingByCampusId(req.body.campus_lid).then(result => {
            console.log('result:::::::::::::',result.recordset)
            res.json({
                status: 200,
                buildingData: result.recordset
            })
        })
    }

}