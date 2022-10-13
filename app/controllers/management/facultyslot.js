const SlotIntervalTimings = require('../../models/SlotIntervalTimings')
const Campuses = require('../../models/Campuses')


module.exports = {
    getPage: (req, res) => {
        Promise.all([SlotIntervalTimings.fetchAll(50), Campuses.fetchAll(50)]).then(result => {
            res.render('management/faculties/slots', {
                timeList: result[0].recordset,
                campusList: result[1].recordset
            })
        })
    }
}