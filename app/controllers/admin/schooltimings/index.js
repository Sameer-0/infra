const {
    check,
    oneOf,
    validationResult
} = require('express-validator');


const schoolTiming = require("../../../models/SchoolTiming")
const CourseDayRoomPreferences = require('../../../models/CourseDayRoomPreferences');
const ProgramSessions = require('../../../models/ProgramSessions');
const Days = require('../../../models/Days');
const SlotIntervalTimings = require('../../../models/SlotIntervalTimings');
const SchoolTimingType = require('../../../models/SchoolTimingType');
const AcadSession = require('../../../models/AcadSession');
const Settings = require('../../../models/Settings') 
const isJsonString = require('../../../utils/util')
const SchoolTimingSettings = require('../../../models/SchoolTimingSettings')

module.exports = {
    getPage: (req, res) => {

        Promise.all([schoolTiming.fetchAllBySettingName(res.locals.slug),  ProgramSessions.getUnlockedProgram(res.locals.slug), Days.fetchActiveDay(res.locals.slug), SlotIntervalTimings.fetchAll(1000), SchoolTimingType.fetchAll(10, res.locals.slug), AcadSession.fetchAll(1000), SchoolTimingSettings.fetchAll(1000, res.locals.slug), SchoolTimingSettings.checkStatus(res.locals.slug), schoolTiming.getCount(res.locals.slug)]).then(result => {
        //   console.log('RESULE::::::::::::::::', typeof result[0].recordset[0], result[0].recordset[0])
            res.render("admin/schooltimings/index", {
                schoolTiming: (typeof result[0].recordset !== "undefined") ? result[0].recordset[0] : '',
                programList: result[1].recordset,
                dayList: result[2].recordset, 
                slotTime: result[3].recordset,
                schoolTimingTypeList: result[4].recordset,
                AcadSessionList: result[5].recordset,
                schoolTimingSettingsList: result[6].recordset,
                schoolTimingSettingsListJson: JSON.stringify(result[6].recordset),
                stsStatus: result[7].recordset.length > 0 ? result[7].recordset[0].status : 0,
                pageCount: result[8].recordset[0].count,
                breadcrumbs: req.breadcrumbs,
            })
        })
    }, 
 

    create: (req, res) => {
        let object = {
            insert_school_timings: JSON.parse(req.body.inputJSON)
        }
        schoolTiming.save(object, res.locals.slug, res.locals.userId, req.body.settingId).then(result => {
            if (req.body.settingName) {
                Settings.updateByName(res.locals.slug, req.body.settingName)
            }
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

    search: (req, res) => {
        let rowcount = 10;
        schoolTiming.search(rowcount, req.body.keyword, res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "School Timing fetched",
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

    pagination: (req, res, ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        schoolTiming.pagination(req.body.pageNo, res.locals.slug).then(result => {
            console.log('resp:::', result)
            res.json({
                status: "200",
                message: "Quotes fetched",
                data: result.recordset,
                length: result.recordset.length
            })
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


    update: (req, res) => {
        let object = {
            update_school_timings: JSON.parse(req.body.inputJSON)
        }
        
        schoolTiming.update(object, res.locals.slug, res.locals.userId).then(result => {
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
        schoolTiming.delete(res.locals.slug, req.body, res.locals.userId).then(result => {
            console.log('result:::::::',result)
           res.status(200).json({status:200, description:"Successfully deleted", data:[]})
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


}