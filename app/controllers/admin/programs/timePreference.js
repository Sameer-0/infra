const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const Programs = require('../../../models/Programs');
const ProgramSessionTimings = require('../../../models/ProgramSessionTimings');
const SlotIntervalTimings = require('../../../models/SlotIntervalTimings')
// const ProgramSessions = require('../../../models/ProgramSessions')
const isJsonString = require('../../../utils/util')


module.exports = {
    getPage: (req, res) => {
        Promise.all([ProgramSessionTimings.fetchAll(10,res.locals.slug), Programs.fetchAll( res.locals.slug), SlotIntervalTimings.fetchAll(1000)]).then(result => {
            console.log('time-list::::', result[0].recordset)
            res.render('admin/programs/programSessionTimePreference', {
                programSessionTimingList: result[0].recordset,
                programList: result[1].recordset,
                timeList: result[2].recordset,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })
            
       
    },

    create: (req, res, next) => {

        let obj ={
            'add_program_session_timings': JSON.parse(req.body.inputJSON)
        }
        console.log(obj)
        ProgramSessionTimings.save(obj, res.locals.slug, res.locals.userId).then( result => {

            res.status(200).json(result)
        })
        .catch(error => {

            console.log('ERROR:::::',error)
            
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

    delete: (req, res, next) => {
        console.log('delete::::<><>');
        ProgramSessionTimings.delete(res.locals.slug, req.body.id, res.locals.userId).then( result => {
            console.log('delete time pre::::', result);
            res.status(200).json(result)
        })
        .catch( error => {
            res.status(500).json(error);
        })

    },

    findOne: (req, res) => {
        ProgramSessionTimings.findOne(req.body.id, res.locals.slug).then(result => {
            console.log('edit result::::', result.recordset[0] )
            res.json({
                status: 200,
                message: "Success",
                result: result.recordset[0]
            })
        }).catch(error => {
            console.log('error::::::::',error)
            res.status(500).json(error.originalError.info.message)
        })
    },

    update: (req, res) => {

        let object = {
            updateProgramSessionTimings: JSON.parse(req.body.inputJSON)
        }
        console.log('pre update::', JSON.parse(req.body.inputJSON)[0].sessionLid)
        ProgramSessionTimings.update(JSON.parse(req.body.inputJSON)[0].startTimeId, JSON.parse(req.body.inputJSON)[0].endTimeId, JSON.parse(req.body.inputJSON)[0].id, res.locals.slug).then(result => {
            console.log('im done', result)
            res.status(200).json(result)
        }).catch(error => {
            // if (isJsonString.isJsonString(error.originalError.info.message)) {
            //     res.status(500).json(JSON.parse(error.originalError.info.message))
            // } else {
            //     res.status(500).json({
            //         status: 500,
            //         description: error.originalError.info.message,
            //         data: []
            //     })
            // }
            console.log('error', error)
        })
    },

    search: (req, res) => {
        ProgramSessionTimings.search(req.body, res.locals.slug).then(result => {
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

    showEntries:(req, res, next)=>{
        ProgramSessionTimings.fetchAll(req.body.rowcount, res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "fetched",
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
}