const EventType = require('../../../models/EventType')

module.exports = {
    getPage: (req, res) => {
        // EventType.fetchAll(10, res.locals.slug).then(result => {
        //     res.render('admin/events/index', {
        //         eventTypeList: result.recordset
        //     })
        // })
        res.render('admin/events/index',{breadcrumbs: req.breadcrumbs})

    }
}