module.exports = {
    getPage:(req, res)=>{
        console.log('crumbsss', req.breadcrumbs)
        res.render("management/academic/index", {
            title:"academic",
            breadcrumbs: req.breadcrumbs,
        });
    }
}