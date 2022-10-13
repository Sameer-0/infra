const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const RoomTransactions = require('../../../models/RoomTransactions')
const RoomTransactionDetails = require('../../../models/RoomTransactionDetails')
const RoomTransactionTypes = require('../../../models/RoomTransactionTypes')
const RoomTransactionStage = require('../../../models/RoomTransactionStages')
const Organizations = require('../../../models/Organizations')
const Campuses = require('../../../models/Campuses')
const Buildings = require('../../../models/Buildings')
const Rooms = require('../../../models/Rooms')
const SlotIntervalTimings = require('../../../models/SlotIntervalTimings')
const AcademicCalender = require('../../../models/AcademicCalender')
const User = require('../../../models/User')
const Settings = require('../../../models/Settings')
const isJsonString = require('../../../utils/util')
const excel = require("exceljs");

module.exports = {
    getPage: (req, res) => {
        console.log('ROOM INDEX:::::::::::>')
        Promise.all([Rooms.bookedRooms(res.locals.slug, 10), Rooms.bookedRoomsCount(res.locals.slug), AcademicCalender.fetchAll(1000)]).then(result => {
            res.render('admin/rooms/index', {
                bookedRoomList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                totalentries: result[1].recordset[0] ? result[1].recordset[0].count : 0,
                academicCalender: JSON.stringify(result[2].recordset),
                breadcrumbs: req.breadcrumbs,
            })
        }) 
    }, 



    create: (req, res) => {

        let object = {
            new_room_transactions: JSON.parse(req.body.inputJSON)
        }
     
        RoomTransactions.save(res.locals.slug, object, res.locals.userId).then(result => {
            //IF ROOM APPLILICED ACCESSFULLY THEN NEED TO UPDATE SETTING TABLE DATA
            if (req.body.settingName) {
                Settings.updateByName(res.locals.slug, req.body.settingName)
            }
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
        let rowcount = 10;
        RoomTransactions.search(req.body, res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
                console.log('searched items::', result.recordset)
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

    pagination: (req, res, ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        RoomTransactions.pagination(req.body.pageNo, res.locals.slug).then(result => {
            res.json({
                status: "200",
                message: "Quotes fetched",
                data: result.recordset,
                length: result.recordset.length
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
        console.log('BODY::::::::::::>>>>>>',req.body.id)
        RoomTransactions.delete(req.body.id, res.locals.slug, res.locals.userId).then(result => {
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





    searchForBookedRooms: (req, res) => {
        RoomTransactions.searchForBookedRooms(req.body, res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
                console.log('searched items::', result.recordset)
                res.json({
                    status: "200",
                    message: "Booked Room Fetched fetched",
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


    bookedRoompagination: (req, res, ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        console.log('HITTING PAGINATION::::::::::::::',req.body.pageNo)

        Rooms.bookedRoomsPagination(res.locals.slug, req.body.pageNo).then(result => {
            console.log('PAGINATION RESULT ::::::::::::::',result.recordset)
            res.json({
                status: "200",
                message: "Quotes fetched",
                data: result.recordset,
                length: result.recordset.length
            })
        }).catch(error => {
            console.log('PAGINATION error ::::::::::::::',error)
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

   bookedRoomsDownloadMaster: async(req, res, next) => {
    let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet('BookedRooms Master');
        worksheet.columns = [
          { header: "Room Number", key: "room_number", width: 20 },
          { header: "Floor Number", key: "floor_number", width: 25 },
          { header: "Capacity", key: "capacity", width: 25 },
          { header: "Building Name", key: "building_name", width: 25 },
          { header: "Start Time", key: "start_time", width: 25 },
          { header: "End Time", key: "end_time", width: 25 },
          { header: "Start Date", key: "start_date", width: 25 },
          { header: "End Date", key: "end_date", width: 25 },
          { header: "Room Type", key: "room_type", width: 25 }
        ];

        Rooms.BookedRoomdownloadExcel(res.locals.slug).then(result => {

            // Add Array Rows
            worksheet.addRows(result.recordset);
            // res is a Stream object
            res.setHeader(
              "Content-Type",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
              "Content-Disposition",
              "attachment; filename=" + "BookedRoomsMaster.xlsx"
            );
            return workbook.xlsx.write(res).then(function () {
              res.status(200).end();
            });
        })
    },

    showEntries:(req, res, next)=>{
        console.log(':::::::::::::::::::showEntries:::::::::::::::::::::')
        Rooms.bookedRooms(res.locals.slug, req.body.rowcount).then(result => {
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

      updateRequest: (req, res) => {

        console.log(':::::::::::::::::::updateRequest::::::::::::::::::::')

        let object = {
            update_room_transactions_details: JSON.parse(req.body.inputJSON)
        }
     
        RoomTransactionDetails.updateRequest(res.locals.slug, object, res.locals.userId).then(result => {
            console.log('success::>>', JSON.parse(result.output.output_json))
            res.status(200).json(JSON.parse(result.output.output_json))
            // res.status(200);
        }).catch(error => {
            console.log('error::::::::::>>',error)
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

    cancelRequest: (req, res) => {

        console.log(':::::::::::::cancelRequest:::::::::::::::')

        let object = {
            trans_cancellation_reasons: JSON.parse(req.body.inputJSON)
        }
     
        RoomTransactionDetails.cancelRequest(res.locals.slug, object, res.locals.userId).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            console.log('error::::::::::>>',error)
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