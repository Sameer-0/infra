module.exports = {
    getPage: (req, res) => {
        res.render('management/booking/index', {breadcrumbs: req.breadcrumbs})
    }
}