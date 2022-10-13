//const EventType = require('../../../models/EventCreation')

module.exports = {
    getPage: (req, res) => {
        res.render('admin/events/sendToSap',{breadcrumbs: req.breadcrumbs})

    }
    
}