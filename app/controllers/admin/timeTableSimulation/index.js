module.exports = {
    getPage:(req, res)=>{
        res.render('admin/timeTableSimulation/index', {breadcrumbs: req.breadcrumbs})
    }
}