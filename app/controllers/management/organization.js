const {
    check,
    oneOf,
    validationResult
} = require('express-validator');
const Organizations = require("../../models/Organizations")
const OrganizationTypes = require("../../models/OrganizationTypes");
const Settings = require('../../models/Settings');
const Campuses = require('../../models/Campuses');
const isJsonString = require('../../utils/util')

module.exports = {
    getPage: (req, res) => {
        if (req.method == "GET") {
            Promise.all([Organizations.fetchAll(10), OrganizationTypes.fetchAll(50), Organizations.getCount(), Campuses.fetchAll(100)]).then(result => {
                res.render('management/organization/index', {
                    orgList: result[0].recordset,
                    orgtypeList: result[1].recordset,
                    pageCount: result[2].recordset[0].count,
                    campusList: result[3].recordset,
                    totalentries: result[0].recordset ? result[0].recordset.length : 0,
                    breadcrumbs: req.breadcrumbs,
                })
            })
        } else if (req.method == "POST") {
            Organizations.fetchChunkRows(req.body.pageNo).then(result => {
                res.json({
                    status: 200,
                    data: result.recordset,
                })
            })
        }
    },

    create: (req, res) => {

        if (req.body.settingName) {
            Settings.updateByName(res.locals.slug, req.body.settingName)
        }

        console.log('req.body::::::::::::::::::::::::::', req.body)
        let object = {
            generate_organization: JSON.parse(req.body.inputJSON)
        }
        Organizations.save(object, res.locals.userId).then(result => {
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

    single: (req, res) => {
        Organizations.getOrgById(req.body.Id).then(result => {
            res.json({
                status: 200,
                orgData: result.recordset[0]
            })
        })
    },

    update: (req, res) => {

        let object = {
            update_organizations: JSON.parse(req.body.inputJSON)
        }

        Organizations.update(object, res.locals.userId).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            console.log('error',error)
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
        Organizations.delete(req.body.id, res.locals.userId).then(result => {
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

        Organizations.searchOrg(req.body).then(result => {
            console.log('result',result)
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
            console.log('error::::::::::::::',error)
            res.json({
                status: "500",
                message: "Something went wrong",
            })
        })
    }
}