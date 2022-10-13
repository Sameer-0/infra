const RoomSlots = require("../../models/RoomSlots")

module.exports = {

    getPage: (req, res) => {
        RoomSlots.fetchAll(10).then(result => {
            res.render('management/room/room_slots', {
                roolSlotList: result.recordset,
                breadcrumbs: req.breadcrumbs,
            })
        })

    }

}