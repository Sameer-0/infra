module.exports = {
    getPage: (req, res) => {
        res.render('admin/sessions/index',{breadcrumbs: req.breadcrumbs,})
    },
    
}