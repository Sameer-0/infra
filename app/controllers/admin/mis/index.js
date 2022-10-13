module.exports = {

    getPage: (req, res) => {
        res.render('admin/mis/index', {
            breadcrumbs: req.breadcrumbs,
            Url: req.originalUrl
        })
    }

}