const {
    validationResult
} = require('express-validator');
const SlotIntervalTimings = require('../../models/SlotIntervalTimings')
const Organizations = require('../../models/Organizations')
const Campuses = require('../../models/Campuses')
const FacultyDbo = require('../../models/FacultyDbo')
const Settings = require('../../models/Settings')
const isJsonString = require('../../utils/util')
const path = require('path');
const soap = require('soap');



module.exports = {

    getPage: (req, res) => {

        Promise.all([SlotIntervalTimings.fetchAll(100), Organizations.fetchAll(100), Campuses.fetchAll(100), FacultyDbo.fetchAll(10), FacultyDbo.getCount()]).then(result => {
            res.render('management/faculties/index', {
                timeList: result[0].recordset,
                orgList: result[1].recordset,
                campusList: result[2].recordset,
                facultyList: result[3].recordset,
                totalentry: result[3].recordset ? result[3].recordset.length : 0,
                pageCount: result[4].recordset.length ? result[4].recordset[0].count : 0,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })
    },

    create: (req, res) => {
        console.log('yelloollew', req.body.settingName )
        if (req.body.settingName) {
            Settings.updateByName(res.locals.slug, req.body.settingName).then(result=> {
                res.status(200).json({"description":"success"})
            })
        }

        // let object = {
        //     add_new_buildings: JSON.parse(req.body.inputJSON)
        // }

        // FacultyDbo.save(object).then(result => {
        //     res.status(200).json(JSON.parse(result.output.output_json))
        // }).catch(error => {
        //     if(isJsonString.isJsonString(error.originalError.info.message)){
        //         res.status(500).json(JSON.parse(error.originalError.info.message))
        //     }
        //     else{
        //         res.status(500).json({status:500,
        //         description:error.originalError.info.message,
        //         data:[]})
        //     }
        // })
    },

    findOne: (req, res) => {
        Faculties.findOne(req.body.Id).then(result => {
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
        FacultyDbo.update(object).then(result => {
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

        console.log('Delete Call', req.body)
        let object = {
            delete_buildings: JSON.parse(req.body.Ids)
        }

        FacultyDbo.delete(object).then(result => {
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

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }


        FacultyDbo.search(req.body).then(result => {
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

    processing: (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }
        FacultyDbo.processing(req.body).then(result => {
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
        FacultyDbo.fetchAll(10).then(result => {
            res.status(200).json({
                result: result.recordset
            })
        }).catch(error => {
            res.status(500).json({
                status: 500,
                message: "Error occured"
            })
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

        FacultyDbo.pagination(req.body.pageNo).then(result => {
            console.log(result)
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

    fetchFromSAP: async (req, res, next) => {

        let {acadYear} = req.body;
        var wsdlUrl = path.join(
            process.env.WSDL_PATH,
            "zhr_holiday_date_jp_bin_sep_20211129.wsdl"
          );
          let soapClient = await new Promise(resolve => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
              if (err) {
                next(err);
              }
              resolve(soapClient);
            })
          })  

          console.log('soapClient:::::::::::::::::>>>',soapClient)

          let facultyList = await new Promise(async resolve => {
            await soapClient.ZhrHolidayDateJp({
                Acadyear: "2018",
                Campusid: "00004533",
                Schoolobjectid: "00004533",
              },
              async function (err, result) {
                let output = await result;
                console.log('output::::::::::::::>>>',output)
                resolve(1);
              });
          })

        //   FacultyDbo.fetchFacultyFromSap(JSON.stringify(facultyList), res.locals.slug).then(data => {
        //     console.log('Data>>> ', data)
        //     res.status(200).json({
        //       data: courseWorkloadList
        //     });
        //   }).catch(err => {
        //     console.log(err)
        //   });

        res.status(200).json({
              data: facultyList
            });
    }
}