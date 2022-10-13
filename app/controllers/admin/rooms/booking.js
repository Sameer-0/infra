const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const RoomTransactions = require('../../../models/RoomTransactions')
const RoomTransactionTypes = require('../../../models/RoomTransactionTypes')
const Organizations = require('../../../models/Organizations')
const Campuses = require('../../../models/Campuses')
const Buildings = require('../../../models/Buildings')
const Rooms = require('../../../models/Rooms')
const SlotIntervalTimings = require('../../../models/SlotIntervalTimings')
const AcademicCalender = require('../../../models/AcademicCalender')
const isJsonString = require('../../../utils/util')
const excel = require("exceljs");

module.exports = {
   
    getBookingPage: (req, res) => {
        console.log('BOOKING PAGE::::::::::')
        Promise.all([RoomTransactions.fetchAll(10, res.locals.slug), RoomTransactions.getCount(res.locals.slug), RoomTransactionTypes.fetchAll(100), Organizations.getChildByParentId(res.locals.organizationId), Campuses.fetchAll(100), Rooms.fetchAll(1000), SlotIntervalTimings.forRoomBooking(1000), AcademicCalender.fetchAll(1000), Buildings.fetchAll(50)]).then(result => {
            res.render('admin/rooms/booking', {
                transactionList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                transactionTypes: JSON.stringify(result[2].recordset),
                orgList: result[3].recordset,
                campusList: result[4].recordset,
                roomList: result[5].recordset,
                slotIntervalTimings: JSON.stringify(result[6].recordset),
                academicCalender: JSON.stringify(result[7].recordset),
                buildingList: result[8].recordset,
                totalentries: result[0].recordset.length ? result[0].recordset.length : 0,
                breadcrumbs: req.breadcrumbs,
            })
        })
    },

    getroomsbybuildingid: (req, res, next) => {
        Rooms.roomsbybuildingid(req.body.building_lid).then(result => {
            res.json({
                status: 200,
                roomList: result.recordset
            })
        })
    },

    roomSlotByRoomId: (req, res, next) => {
        SlotIntervalTimings.roomSlotByRoomId(req.body.roomLid).then(result => {
            res.json({
                status: 200,
                roomslot: result.recordset
            })
        })
    },

    downloadMaster: async (req, res, next) => {
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet('Roombooking Master');
        worksheet.columns = [{
                header: "Transaction Type",
                key: "transaction_type",
                width: 25
            },
            {
                header: "Stage",
                key: "stage",
                width: 25
            },
            {
                header: "Org Name",
                key: "org_name",
                width: 30
            },
            {
                header: "Org Abbr",
                key: "org_abbr",
                width: 25
            },
            {
                header: "Campus Abbr",
                key: "campus_abbr",
                width: 25
            },
            {
                header: "Username",
                key: "username",
                width: 25
            }
        ];

        Rooms.RoomTransactionsdownloadExcel(res.locals.slug).then(result => {
            console.log('result', result.recordset)
            // Add Array Rows
            worksheet.addRows(result.recordset);
            // res is a Stream object
            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=" + "RoombookingMaster.xlsx"
            );
            return workbook.xlsx.write(res).then(function () {
                res.status(200).end();
            });
        })
    },

    showBookingEntries: (req, res, next) => {
        RoomTransactions.fetchAll(req.body.rowcount, res.locals.slug).then(result => {
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
    }
}