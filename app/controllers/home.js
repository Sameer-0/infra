const OrganizationSlug = require('../models/OrganizationSlug')

module.exports = {

    renderHomePage: (req, res, next) => {
        OrganizationSlug.fetchAll().then(result => {
            console.log(result.recordset)
            res.render('index', {orgList: result.recordset})
        })
    }
}