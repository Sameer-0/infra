const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const RoomTypes = require('../../models/RoomTypes')

module.exports = {
    getPage: (req, res) => {
        RoomTypes.fetchAll(100).then(result => {
            res.render('management/room/roomtype', {
                roomTypes: result.recordset,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })
    },

    create: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        RoomTypes.save(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    single: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        RoomTypes.getRoomTypeById(req.body.Id).then(result => {
            res.json({
                status: 200,
                message: "Success",
                data: result.recordset[0]
            })
        })
    },

    update: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        RoomTypes.update(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    delete: (req, res) => {
        RoomTypes.delete(req.body.Ids).then(result => {
            res.json({
                status: 200,
                message: "Success"
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

        //here 10is rowcount
        let rowcont = 10;
        RoomTypes.searchRoomType(rowcont, req.body.keyword).then(result => {
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
            res.json({
                status: "500",
                message: "Something went wrong",
            })
        })
    }

}